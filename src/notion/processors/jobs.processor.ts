import { Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';

import { JOBS, QUEUES } from '../constants';

@Processor(QUEUES.NOTION_JOBS)
export class NotionJobsProcessor {
  private readonly logger = new Logger(NotionJobsProcessor.name);

  constructor() {
    //
  }

  @Process(JOBS.CREATE_CONTENT)
  async createContentJob() {
    console.log('create content job');
  }

  @Process(JOBS.UPDATE_CONTENT)
  async updateContentJob() {
    console.log('update content job');
  }

  @Process(JOBS.DELETE_CONTENT)
  async deleteContentJob() {
    console.log('delete content job');
  }
}
