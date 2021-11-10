import { Job, Queue } from 'bull';

import { Logger } from '@nestjs/common';
import { InjectQueue, Process, Processor } from '@nestjs/bull';

import { JOBS } from '../../shared/jobs';
import { QUEUES } from '../../shared/queues';

import { NotionBlockService } from '../services';
import {
  CheckBlockFetchStatus,
  UpdateNotionBlockJob,
} from '../../shared/jobs/block';
import { AggregateContentBlocksJob } from 'src/shared/jobs/content';

@Processor(QUEUES.NOTION_BLOCKS)
export class NotionBlockProcessor {
  private readonly logger = new Logger(NotionBlockProcessor.name);

  constructor(
    private notionBlockService: NotionBlockService,

    @InjectQueue(QUEUES.CONTENT)
    private contentQueue: Queue,
  ) {}

  @Process(JOBS.UPDATE_NOTION_BLOCK)
  public updateNotionBlockJob({ data }: Job<UpdateNotionBlockJob>): void {
    this.notionBlockService.upsertBlock({
      blockID: data.blockID,
      isUpdating: data.isUpdating ?? false,
      childrenBlocks: data.childrenBlocks
        ? JSON.stringify(data.childrenBlocks)
        : '',
      lastEditedAt: data.lastEditedAt
        ? new Date(data.lastEditedAt)
        : new Date(),
    });
  }

  @Process(JOBS.CHECK_BLOCK_FETCH_STATUS)
  public async checkFetchStatusJob({
    data,
  }: Job<CheckBlockFetchStatus>): Promise<any> {
    try {
      await this.notionBlockService.checkBlockStatus(data.blockID);
    } catch (error) {
      throw new Error('Not all children blocks were fetched yet.');
    }

    const aggregateContentBlocksJob: AggregateContentBlocksJob = {
      blockID: data.blockID,
    };
    await this.contentQueue.add(
      JOBS.AGGREGATE_CONTENT_BLOCKS,
      aggregateContentBlocksJob,
    );
  }
}
