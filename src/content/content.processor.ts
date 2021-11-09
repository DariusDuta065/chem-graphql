import { Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';

import { JOBS } from '../shared/jobs';
import { QUEUES } from '../shared/queues';

@Processor(QUEUES.CONTENT)
export class ContentProcessor {
  private readonly logger = new Logger(ContentProcessor.name);

  constructor() {
    //
  }

  @Process(JOBS.CREATE_CONTENT)
  public async createContentJob() {
    console.log('create content job');
  }

  @Process(JOBS.UPDATE_CONTENT)
  public async updateContentJob() {
    console.log('update content job');
  }

  @Process(JOBS.DELETE_CONTENT)
  public async deleteContentJob() {
    console.log('delete content job');
  }
}
