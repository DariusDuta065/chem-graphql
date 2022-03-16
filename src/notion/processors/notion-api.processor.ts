import { Job, Queue } from 'bull';
import { EventBus } from '@nestjs/cqrs';

import { Logger } from '@nestjs/common';
import { InjectQueue, Process, Processor } from '@nestjs/bull';

import { Content } from 'src/content/content.entity';
import { ContentService } from 'src/content/content.service';
import { NotionAPIService, NotionBlockService } from '../services';

import {
  NotionPageCreatedEvent,
  NotionPageDeletedEvent,
  NotionPageUpdatedEvent,
} from '../events';
import {
  JOBS,
  FetchNotionBlockJob,
  UpdateNotionBlockJob,
} from 'src/shared/jobs';
import { NotionPage } from '../types';
import { QUEUES } from 'src/shared/queues';

@Processor(QUEUES.NOTION_API)
export class NotionAPIProcessor {
  private readonly logger = new Logger(NotionAPIProcessor.name);

  constructor(
    private eventBus: EventBus,

    private contentService: ContentService,
    private notionApiService: NotionAPIService,

    @InjectQueue(QUEUES.NOTION_API)
    private apiQueue: Queue,
    @InjectQueue(QUEUES.NOTION_BLOCKS)
    private blocksQueue: Queue,
  ) {}

  @Process(JOBS.SYNC_NOTION)
  public async syncNotionJob(): Promise<void> {
    this.logger.debug(`Started processing ${JOBS.SYNC_NOTION} job`);

    try {
      const [notionBlocks, contents] = await Promise.all([
        this.notionApiService.getPagesMetadata(),
        this.contentService.getContent(),
      ]);

      const { common, notInDB, notInNotion } =
        NotionBlockService.getBlocksDifferences(
          notionBlocks.map((b) => b.id),
          contents.map((b) => b.blockID),
        );

      this.createPages(notInDB, notionBlocks);
      this.deletePages(notInNotion, contents);
      this.updatePages(common, contents, notionBlocks);
    } catch (error) {
      this.logger.error(`Error in ${JOBS.SYNC_NOTION} ${error}`);
      throw error;
    }
  }

  @Process(JOBS.FETCH_NOTION_BLOCK)
  public async fetchNotionBlockJob({
    data,
  }: Job<FetchNotionBlockJob>): Promise<void> {
    this.logger.debug(
      `Started ${JOBS.FETCH_NOTION_BLOCK} (block ID: ${data.blockID})`,
    );
    const { blockID } = data;

    try {
      const { last_edited_time } = await this.notionApiService.getBlockMetadata(
        blockID,
      );

      await this.blocksQueue.add(JOBS.UPDATE_NOTION_BLOCK, {
        blockID,
        lastEditedAt: last_edited_time,
        isUpdating: true,
        childrenBlocks: [],
      } as UpdateNotionBlockJob);

      const blockData = await this.notionApiService.getChildrenBlocks(blockID);

      for (const blockID of blockData.parentBlocks) {
        const fetchNotionBlockJob: FetchNotionBlockJob = {
          blockID,
        };
        await this.apiQueue.add(JOBS.FETCH_NOTION_BLOCK, fetchNotionBlockJob);
      }

      await this.blocksQueue.add(JOBS.UPDATE_NOTION_BLOCK, {
        blockID,
        lastEditedAt: last_edited_time,
        isUpdating: false,
        childrenBlocks: blockData.childrenBlocks,
      });
    } catch (error) {
      this.logger.error(`Error in ${JOBS.FETCH_NOTION_BLOCK} ${error}`);
      throw error;
    }
  }

  /**
   * This method receives the blocks that are present in Notion's DB,
   * but currently not in `contents` table, and hence need to be
   * created.
   *
   * @param {string[]} blockIDs
   * @param {NotionPage[]} notionBlocks
   */
  private createPages(blockIDs: string[], notionBlocks: NotionPage[]): void {
    for (const blockID of blockIDs) {
      const notionBlock = notionBlocks.find((b) => b.id === blockID);

      if (!notionBlock) {
        this.logger.warn(`Notion block ${blockID} not found`);
        continue;
      }

      this.eventBus.publish(new NotionPageCreatedEvent(notionBlock));
    }
  }

  /**
   * This method receives the blocks that are in the `contents`
   * table, but were not found in Notion's DB - meaning that the page
   * has been deleted from Notion since the last check.
   *
   * @param {Content[]} contents
   * @param {string[]} dbBlocks
   */
  private deletePages(blockIDs: string[], contents: Content[]): void {
    for (const blockID of blockIDs) {
      const content = contents.find((b) => b.blockID === blockID);

      if (!content) {
        this.logger.warn(`Notion block ${blockID} not found`);
        continue;
      }

      this.eventBus.publish(new NotionPageDeletedEvent(content));
    }
  }

  /**
   * This method receives the blocks that are found in both Notion's DB
   * and the `contents` table; it then updates all pages.
   *
   * @param {string[]} blockIDs
   * @param {Content[]} contents
   * @param {NotionPage[]} notionBlocks
   */
  private updatePages(
    blockIDs: string[],
    contents: Content[],
    notionBlocks: NotionPage[],
  ): void {
    for (const blockID of blockIDs) {
      const notionBlock = notionBlocks.find((b) => b.id === blockID);
      const content = contents.find((b) => b.blockID === blockID);

      if (!notionBlock || !content) {
        this.logger.warn(`Notion block ${blockID} not found`);
        continue;
      }

      /**
       * https://developers.notion.com/changelog/last-edited-time-is-now-rounded-to-the-nearest-minute
       *
       * Notion approximates updates to the nearest minute, meaning that multiple updates made on a page
       * within the same minute will not be reflected in the `content` or `notion_block` table since
       * there is no way of telling if we have the latest version by just looking at the `last_edited_at` fields.
       *
       * On top of that, children blocks do not update their parent blocks' `last_edited_at`, but only their own
       * block -- this means that `notion_block.last_edited_at` will not reflect when a child of that block
       * has been updated.
       *
       * Thus, we have to assume that every page block must be refetched whenever `SyncNotionJob` happens.
       */
      this.eventBus.publish(new NotionPageUpdatedEvent(content, notionBlock));
    }
  }
}
