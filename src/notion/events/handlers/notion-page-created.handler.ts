import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import {
  CheckBlockFetchStatusJob,
  CreateContentJob,
  FetchNotionBlockJob,
  JOBS,
} from 'src/shared/jobs';
import { QUEUES } from 'src/shared/queues';
import { NotionPageCreatedEvent } from 'src/notion/events';

@EventsHandler(NotionPageCreatedEvent)
export class NotionPageCreatedHandler
  implements IEventHandler<NotionPageCreatedEvent>
{
  constructor(
    @InjectQueue(QUEUES.NOTION_API)
    private apiQueue: Queue,
    @InjectQueue(QUEUES.NOTION_BLOCKS)
    private blocksQueue: Queue,
    @InjectQueue(QUEUES.CONTENT)
    private contentQueue: Queue,
  ) {}

  public async handle(event: NotionPageCreatedEvent): Promise<void> {
    await this.enqueueCreateContentJob(event);
    await this.enqueueFetchNotionBlockJob(event);
    await this.enqueueCheckBlockFetchStatusJob(event);
  }

  private async enqueueCreateContentJob(
    event: NotionPageCreatedEvent,
  ): Promise<void> {
    const { notionBlock } = event;

    const createContentJob: CreateContentJob = {
      blockID: notionBlock.id,
      title: notionBlock.title,
      type: notionBlock.type,
      lastEditedAt: notionBlock.lastEditedAt,
    };

    await this.contentQueue.add(JOBS.CREATE_CONTENT, createContentJob);
  }

  private async enqueueFetchNotionBlockJob(
    event: NotionPageCreatedEvent,
  ): Promise<void> {
    const { notionBlock } = event;

    const fetchNotionBlockJob: FetchNotionBlockJob = {
      blockID: notionBlock.id,
    };

    await this.apiQueue.add(
      JOBS.FETCH_NOTION_BLOCK,
      fetchNotionBlockJob,
      JOBS.OPTIONS.RETRIED,
    );
  }

  private async enqueueCheckBlockFetchStatusJob(
    event: NotionPageCreatedEvent,
  ): Promise<void> {
    const { notionBlock } = event;

    const checkBlockFetchStatusJob: CheckBlockFetchStatusJob = {
      blockID: notionBlock.id,
    };

    await this.blocksQueue.add(
      JOBS.CHECK_BLOCK_FETCH_STATUS,
      checkBlockFetchStatusJob,
      {
        ...JOBS.OPTIONS.RETRIED,
        ...JOBS.OPTIONS.DELAYED,
      },
    );
  }
}
