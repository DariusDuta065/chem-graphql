import { Job } from 'bull';

import { Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';

import { JOBS } from '../../shared/jobs';
import { QUEUES } from '../../shared/queues';

import { NotionBlockService } from '../services';
import {
  CheckBlockFetchStatus,
  DeleteNotionBlockJob,
  UpdateNotionBlockJob,
} from '../../shared/jobs/block';

@Processor(QUEUES.NOTION_BLOCKS)
export class NotionBlockProcessor {
  private readonly logger = new Logger(NotionBlockProcessor.name);

  constructor(private notionBlockService: NotionBlockService) {}

  @Process(JOBS.UPDATE_NOTION_BLOCK)
  public async updateNotionBlockJob({ data }: Job<UpdateNotionBlockJob>) {
    console.log('UPDATE notion block');

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

  @Process(JOBS.DELETE_NOTION_BLOCK)
  public async deleteNotionBlockJob({ data }: Job<DeleteNotionBlockJob>) {
    console.log('DELETE notion block', data.blockID);

    this.notionBlockService.deleteBlock(data.blockID);
  }

  @Process(JOBS.CHECK_FETCH_STATUS)
  public async checkFetchStatusJob({ data }: Job<CheckBlockFetchStatus>) {
    console.log('CHECKING fetch status', data.blockID);
  }
}
