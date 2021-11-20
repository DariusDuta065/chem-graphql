import { Job, Queue } from 'bull';

import { Logger } from '@nestjs/common';
import { InjectQueue, Process, Processor } from '@nestjs/bull';

import {
  JOBS,
  UpdateNotionBlockJob,
  CheckBlockFetchStatusJob,
  AggregateContentBlocksJob,
} from 'src/shared/jobs';
import { QUEUES } from 'src/shared/queues';

import { NotionBlockService } from '../services';
import { NotionBlock } from '../notion-block.entity';

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
    const blockData: NotionBlock = {
      blockID: data.blockID,
      lastEditedAt: new Date(data.lastEditedAt),
      isUpdating: data.isUpdating,
      childrenBlocks: JSON.stringify(data.childrenBlocks),
    };

    this.notionBlockService.upsertBlock(blockData);
  }

  @Process(JOBS.CHECK_BLOCK_FETCH_STATUS)
  public async checkFetchStatusJob({
    data,
  }: Job<CheckBlockFetchStatusJob>): Promise<any> {
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
