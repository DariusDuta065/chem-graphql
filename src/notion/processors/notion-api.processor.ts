import { Job, Queue } from 'bull';

import { Logger } from '@nestjs/common';
import { InjectQueue, Process, Processor } from '@nestjs/bull';

import { Content } from '../../content/content.entity';
import { ContentService } from '../../content/content.service';
import { NotionAPIService, NotionBlockService } from '../services';

import { NotionPage } from '../types';
import { JOBS } from '../../shared/jobs';
import { QUEUES } from '../../shared/queues';

import {
  CreateContentJob,
  DeleteContentJob,
  UpdateContentJob,
} from '../../shared/jobs';
import {
  CheckBlockFetchStatus,
  FetchNotionBlockJob,
  UpdateNotionBlockJob,
} from '../../shared/jobs';

@Processor(QUEUES.NOTION_API)
export class NotionAPIProcessor {
  private readonly logger = new Logger(NotionAPIProcessor.name);

  constructor(
    private contentService: ContentService,
    private notionApiService: NotionAPIService,

    @InjectQueue(QUEUES.NOTION_API)
    private apiQueue: Queue,
    @InjectQueue(QUEUES.NOTION_BLOCKS)
    private blocksQueue: Queue,
    @InjectQueue(QUEUES.CONTENT)
    private contentQueue: Queue,
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
      const lastEditedAt: string =
        last_edited_time instanceof Date
          ? last_edited_time.toISOString()
          : last_edited_time;

      let updateNotionBlockJob: UpdateNotionBlockJob = {
        blockID,
        lastEditedAt,
        isUpdating: true,
        childrenBlocks: [],
      };
      await this.blocksQueue.add(
        JOBS.UPDATE_NOTION_BLOCK,
        updateNotionBlockJob,
      );

      const blockData = await this.notionApiService.getChildrenBlocks(blockID);

      for (const blockID of blockData.parentBlocks) {
        const fetchNotionBlockJob: FetchNotionBlockJob = {
          blockID,
        };
        await this.apiQueue.add(
          JOBS.FETCH_NOTION_BLOCK,
          fetchNotionBlockJob,
          JOBS.OPTIONS.RETRIED,
        );
      }

      updateNotionBlockJob = {
        blockID,
        lastEditedAt,
        isUpdating: false,
        childrenBlocks: blockData.childrenBlocks,
      };
      await this.blocksQueue.add(
        JOBS.UPDATE_NOTION_BLOCK,
        updateNotionBlockJob,
      );
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

      this.handlePageCreation(notionBlock);
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

      this.handlePageDeletion(content);
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
      this.handlePageUpdation(content, notionBlock);
    }
  }

  private handlePageCreation(notionBlock: NotionPage): void {
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
    this.apiQueue.add(
      JOBS.FETCH_NOTION_BLOCK,
      fetchNotionBlockJob,
      JOBS.OPTIONS.RETRIED,
    );
    this.blocksQueue.add(
      JOBS.CHECK_BLOCK_FETCH_STATUS,
      checkBlockFetchStatusJob,
      {
        ...JOBS.OPTIONS.RETRIED,
        ...JOBS.OPTIONS.DELAYED,
      },
    );
  }

  private handlePageUpdation(content: Content, notionBlock: NotionPage): void {
    const updateContentJob: UpdateContentJob = {
      id: content.id,
      blockID: notionBlock.id,
      title: notionBlock.title,
      type: notionBlock.type,
      lastEditedAt: notionBlock.lastEditedAt,
      blocks: content.blocks,
    };
    const fetchNotionBlockJob: FetchNotionBlockJob = {
      blockID: notionBlock.id,
    };
    const checkBlockFetchStatusJob: CheckBlockFetchStatus = {
      blockID: notionBlock.id,
    };

    this.contentQueue.add(JOBS.UPDATE_CONTENT, updateContentJob);
    this.apiQueue.add(
      JOBS.FETCH_NOTION_BLOCK,
      fetchNotionBlockJob,
      JOBS.OPTIONS.RETRIED,
    );
    this.blocksQueue.add(
      JOBS.CHECK_BLOCK_FETCH_STATUS,
      checkBlockFetchStatusJob,
      {
        ...JOBS.OPTIONS.RETRIED,
        ...JOBS.OPTIONS.DELAYED,
      },
    );
  }

  private handlePageDeletion(content: Content): void {
    const deleteContentJob: DeleteContentJob = {
      blockID: content.blockID,
    };

    this.contentQueue.add(JOBS.DELETE_CONTENT, deleteContentJob);
  }
}
