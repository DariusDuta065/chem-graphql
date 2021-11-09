import { Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  PageCreatedEvent,
  PageDeletedEvent,
  PageUpdatedEvent,
} from '../events';

import { NotionAPIService, NotionBlockService } from '../services';
import { QUEUES, JOBS, EVENTS } from '../constants';
import { NotionBlock } from '../notion-block.entity';
import { NotionPage } from '../types';

@Processor(QUEUES.NOTION_API_QUERIES)
export class NotionQueriesProcessor {
  private readonly logger = new Logger(NotionQueriesProcessor.name);

  constructor(
    private eventEmitter: EventEmitter2,
    private notionApiService: NotionAPIService,
    private notionBlockService: NotionBlockService,
  ) {}

  @Process(JOBS.SYNC_NOTION)
  public async syncNotionJob() {
    this.logger.debug(`Started processing ${JOBS.SYNC_NOTION} job`);

    try {
      const [notionBlocks, dbBlocks] = await Promise.all([
        this.notionApiService.getPagesMetadata(),
        this.notionBlockService.getBlocks(),
      ]);

      const { common, notInDB, notInNotion } =
        NotionBlockService.getBlocksDifferences(
          notionBlocks.map((b) => b.id),
          dbBlocks.map((b) => b.blockID),
        );

      this.createPages(notInDB, notionBlocks);
      this.deletePages(notInNotion, dbBlocks);
      this.updatePages(common, dbBlocks, notionBlocks);
    } catch (error) {
      this.logger.error(`Error in ${JOBS.SYNC_NOTION} ${error}`);
    }
  }

  /**
   * This method receives the blocks that are present in Notion's DB,
   * but currently not in `notion_blocks` table, and hence need to be
   * created. In order to do so later, it emits the `page.created` event.
   *
   * @param {string[]} blockIDs
   * @param {NotionPage[]} notionBlocks
   */
  private createPages(blockIDs: string[], notionBlocks: NotionPage[]) {
    for (const blockID of blockIDs) {
      const notionBlock = notionBlocks.find((b) => b.id === blockID);

      if (!notionBlock) {
        this.logger.warn(`Notion block ${blockID} not found`);
        continue;
      }

      this.emitPageCreated(notionBlock);
    }
  }

  /**
   * This method receives the blocks that are in the `notion_blocks`
   * table, but were not found in Notion's DB - meaning that the page
   * has been deleted from Notion since the last check.
   * It will emit the `page.deleted` event, such that the content will
   * eventually be deleted from the system too.
   *
   * @param {NotionBlock[]} blockIDs
   * @param {string[]} dbBlocks
   */
  private deletePages(blockIDs: string[], dbBlocks: NotionBlock[]) {
    for (const blockID of blockIDs) {
      const dbBlock = dbBlocks.find((b) => b.blockID === blockID);

      if (!dbBlock) {
        this.logger.warn(`Notion block ${blockID} not found`);
        continue;
      }

      this.emitPageDeleted(dbBlock);
    }
  }

  /**
   * This method receives the blocks that are found in both Notion's DB
   * and the `notion_blocks` table; it then checks if Notion has a version
   * of that block that is newer (via the `last_edited_at` field).
   * If it has, it will emit the `page.updated` event.
   *
   * @param {string[]} blocks
   * @param {NotionBlock[]} dbBlocks
   * @param {NotionPage[]} notionBlocks
   */
  private updatePages(
    blocks: string[],
    dbBlocks: NotionBlock[],
    notionBlocks: NotionPage[],
  ) {
    for (const blockID of blocks) {
      const notionBlock = notionBlocks.find((b) => b.id === blockID);
      const dbBlock = dbBlocks.find((b) => b.blockID === blockID);

      if (!notionBlock || !dbBlock) {
        this.logger.warn(`Notion block ${blockID} not found`);
        continue;
      }

      const notionDate = new Date(notionBlock.lastEditedAt);
      const dbDate = new Date(dbBlock.lastEditedAt);

      if (notionDate > dbDate) {
        this.emitPageUpdated(notionBlock);
      }
    }
  }

  private emitPageCreated(notionBlock: NotionPage) {
    const e = new PageCreatedEvent();
    e.blockID = notionBlock.id;
    e.title = notionBlock.title;
    e.type = notionBlock.type;
    e.lastEditedAt = notionBlock.lastEditedAt;

    this.eventEmitter.emitAsync(EVENTS.PAGE_CREATED, e);
  }

  private emitPageUpdated(notionBlock: NotionPage) {
    const e = new PageUpdatedEvent();
    e.blockID = notionBlock.id;
    e.title = notionBlock.title;
    e.type = notionBlock.type;
    e.lastEditedAt = notionBlock.lastEditedAt;

    this.eventEmitter.emitAsync(EVENTS.PAGE_UPDATED, e);
  }

  private emitPageDeleted(notionBlock: NotionBlock) {
    const e = new PageDeletedEvent();
    e.blockID = notionBlock.blockID;

    this.eventEmitter.emitAsync(EVENTS.PAGE_DELETED, e);
  }
}
