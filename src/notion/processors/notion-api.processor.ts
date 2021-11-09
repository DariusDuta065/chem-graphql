import { Job, Queue } from 'bull';

import { Logger } from '@nestjs/common';
import { InjectQueue, Process, Processor } from '@nestjs/bull';

import { NotionAPIService, NotionBlockService } from '../services';
import { NotionBlock } from '../notion-block.entity';
import { NotionPage } from '../types';

import { JOBS } from '../../shared/jobs';
import { QUEUES } from '../../shared/queues';

import {
  CreateContentJob,
  DeleteContentJob,
  UpdateContentJob,
} from '../../shared/jobs/content';
import {
  CheckBlockFetchStatus,
  DeleteNotionBlockJob,
  FetchNotionBlockJob,
  UpdateNotionBlockJob,
} from '../../shared/jobs/block';

@Processor(QUEUES.NOTION_API)
export class NotionAPIProcessor {
  private readonly logger = new Logger(NotionAPIProcessor.name);

  constructor(
    private notionApiService: NotionAPIService,
    private notionBlockService: NotionBlockService,

    @InjectQueue(QUEUES.NOTION_API)
    private apiQueue: Queue,
    @InjectQueue(QUEUES.NOTION_BLOCKS)
    private blocksQueue: Queue,
    @InjectQueue(QUEUES.CONTENT)
    private contentQueue: Queue,
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

      // ERROR here: i'm looking inside `notion_blocks` whereas
      // i should be looking for `content.block_id`.
      // otherwise i just delete the children
      this.deletePages(notInNotion, dbBlocks);

      this.updatePages(common, dbBlocks, notionBlocks);
    } catch (error) {
      this.logger.error(`Error in ${JOBS.SYNC_NOTION} ${error}`);
    }
  }

  @Process(JOBS.FETCH_NOTION_BLOCK)
  public async fetchNotionBlockJob({ data }: Job<FetchNotionBlockJob>) {
    this.logger.debug(`Started processing ${JOBS.FETCH_NOTION_BLOCK} job`);
    const { blockID } = data;

    try {
      let updateNotionBlockJob: UpdateNotionBlockJob = {
        blockID,
        isUpdating: true,
      };
      this.blocksQueue.add(JOBS.UPDATE_NOTION_BLOCK, updateNotionBlockJob);

      const { lastEditedAt, childrenBlocks, parentBlocks } =
        await this.notionApiService.getBlocksFromNotion(blockID);

      updateNotionBlockJob = {
        blockID,
        lastEditedAt,
        childrenBlocks,
        isUpdating: false,
      };
      this.blocksQueue.add(JOBS.UPDATE_NOTION_BLOCK, updateNotionBlockJob);

      for (const blockID of parentBlocks) {
        const fetchNotionBlockJob: FetchNotionBlockJob = {
          blockID,
        };
        this.apiQueue.add(JOBS.FETCH_NOTION_BLOCK, fetchNotionBlockJob);
      }
    } catch (error) {
      this.logger.error(`Error in ${JOBS.FETCH_NOTION_BLOCK} ${error}`);
      throw error;
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

      this.handlePageCreation(notionBlock);
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

      this.handlePageDeletion(dbBlock);
    }
  }

  /**
   * This method receives the blocks that are found in both Notion's DB
   * and the `notion_blocks` table; it then checks if Notion has a version
   * of that block that is newer (via the `last_edited_at` field).
   * If it has, it will emit the `page.updated` event.
   *
   * @param {string[]} blockIDs
   * @param {NotionBlock[]} dbBlocks
   * @param {NotionPage[]} notionBlocks
   */
  private updatePages(
    blockIDs: string[],
    dbBlocks: NotionBlock[],
    notionBlocks: NotionPage[],
  ) {
    for (const blockID of blockIDs) {
      const notionBlock = notionBlocks.find((b) => b.id === blockID);
      const dbBlock = dbBlocks.find((b) => b.blockID === blockID);

      if (!notionBlock || !dbBlock) {
        this.logger.warn(`Notion block ${blockID} not found`);
        continue;
      }

      const notionDate = new Date(notionBlock.lastEditedAt);
      const dbDate = new Date(dbBlock.lastEditedAt);

      if (notionDate > dbDate) {
        this.handlePageUpdation(notionBlock);
      }
    }
  }

  private handlePageCreation(notionBlock: NotionPage) {
    const createContentJob: CreateContentJob = {
      blockID: notionBlock.id,
      title: notionBlock.title,
      type: notionBlock.type,
      lastEditedAt: notionBlock.lastEditedAt,
    };
    const fetchNotionBlockJob: FetchNotionBlockJob = {
      blockID: notionBlock.id,
    };
    const checkBlockFetchStatusJob: CheckBlockFetchStatus = {
      blockID: notionBlock.id,
    };

    this.contentQueue.add(JOBS.CREATE_CONTENT, createContentJob);
    this.apiQueue.add(JOBS.FETCH_NOTION_BLOCK, fetchNotionBlockJob);
    this.blocksQueue.add(JOBS.CHECK_FETCH_STATUS, checkBlockFetchStatusJob);
  }

  private handlePageUpdation(notionBlock: NotionPage) {
    const updateContentJob: UpdateContentJob = {
      blockID: notionBlock.id,
      title: notionBlock.title,
      type: notionBlock.type,
      lastEditedAt: notionBlock.lastEditedAt,
    };
    const fetchNotionBlockJob: FetchNotionBlockJob = {
      blockID: notionBlock.id,
    };

    this.contentQueue.add(JOBS.UPDATE_CONTENT, updateContentJob);
    this.apiQueue.add(JOBS.FETCH_NOTION_BLOCK, fetchNotionBlockJob);
  }

  private handlePageDeletion(notionBlock: NotionBlock) {
    const deleteContentJob: DeleteContentJob = {
      blockID: notionBlock.blockID,
    };
    const deleteNotionBlockJob: DeleteNotionBlockJob = {
      blockID: notionBlock.blockID,
    };

    this.contentQueue.add(JOBS.DELETE_CONTENT, deleteContentJob);
    this.blocksQueue.add(JOBS.DELETE_NOTION_BLOCK, deleteNotionBlockJob);
  }
}
