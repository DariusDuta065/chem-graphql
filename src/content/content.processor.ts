import { Job } from 'bull';

import { Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';

import { JOBS } from '../shared/jobs';
import { QUEUES } from '../shared/queues';
import {
  AggregateContentBlocksJob,
  CreateContentJob,
  DeleteContentJob,
  UpdateContentJob,
} from '../shared/jobs/content';
import { ContentService } from './content.service';
import { Content } from './content.entity';

@Processor(QUEUES.CONTENT)
export class ContentProcessor {
  private readonly logger = new Logger(ContentProcessor.name);

  constructor(private contentService: ContentService) {}

  @Process(JOBS.CREATE_CONTENT)
  public async createContentJob({
    data,
  }: Job<CreateContentJob>): Promise<void> {
    // this.logger.debug(`Started processing ${JOBS.CREATE_CONTENT} job`);

    const content = new Content();
    content.blockID = data.blockID;
    content.title = data.title;
    content.type = data.type;
    content.lastEditedAt = new Date(data.lastEditedAt);
    content.blocks = '';

    this.contentService.insertContent(content);
  }

  @Process(JOBS.UPDATE_CONTENT)
  public async updateContentJob({
    data,
  }: Job<UpdateContentJob>): Promise<void> {
    // this.logger.debug(`Started processing ${JOBS.UPDATE_CONTENT} job`);

    this.contentService.updateContent({
      id: data.id,
      blockID: data.blockID,
      title: data.title,
      type: data.type,
      blocks: data.blocks,
      lastEditedAt: data.lastEditedAt
        ? new Date(data.lastEditedAt)
        : new Date(),
    });
  }

  @Process(JOBS.DELETE_CONTENT)
  public async deleteContentJob({
    data,
  }: Job<DeleteContentJob>): Promise<void> {
    // this.logger.debug(`Started processing ${JOBS.DELETE_CONTENT} job`);

    this.contentService.deleteContent(data.blockID);
  }

  @Process(JOBS.AGGREGATE_CONTENT_BLOCKS)
  public async aggregateContentBlocksJob({
    data,
  }: Job<AggregateContentBlocksJob>): Promise<void> {
    // this.logger.debug(
    //   `Started processing ${JOBS.AGGREGATE_CONTENT_BLOCKS} job`,
    // );

    this.contentService.aggregateContentBlocks(data.blockID);
  }
}
