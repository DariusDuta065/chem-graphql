import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import {
  JOBS,
  ChannelName,
  UpdateContentJob,
  FetchNotionBlockJob,
  SendDiscordMessageJob,
} from 'src/shared/jobs';
import { QUEUES } from 'src/shared/queues';
import { NotionPageUpdatedEvent } from 'src/notion/events';

@EventsHandler(NotionPageUpdatedEvent)
export class NotionPageUpdatedHandler
  implements IEventHandler<NotionPageUpdatedEvent>
{
  constructor(
    @InjectQueue(QUEUES.NOTION_API)
    private apiQueue: Queue,
    @InjectQueue(QUEUES.NOTION_BLOCKS)
    private blocksQueue: Queue,
    @InjectQueue(QUEUES.CONTENT)
    private contentQueue: Queue,
    @InjectQueue(QUEUES.DISCORD)
    private discordQueue: Queue,
  ) {}

  public async handle(event: NotionPageUpdatedEvent): Promise<void> {
    await this.enqueueUpdateContentJob(event);
    await this.enqueueFetchNotionBlockJob(event);
    await this.enqueueSendDiscordMessageJob(event);
  }

  private async enqueueUpdateContentJob(
    event: NotionPageUpdatedEvent,
  ): Promise<void> {
    const { content, notionBlock } = event;

    const updateContentJob: UpdateContentJob = {
      id: content.id,
      blockID: notionBlock.id,
      title: notionBlock.title,
      type: notionBlock.type,
      lastEditedAt: notionBlock.lastEditedAt,
      blocks: content.blocks,
    };
    await this.contentQueue.add(JOBS.UPDATE_CONTENT, updateContentJob);
  }

  private async enqueueFetchNotionBlockJob(
    event: NotionPageUpdatedEvent,
  ): Promise<void> {
    const { notionBlock } = event;

    const fetchNotionBlockJob: FetchNotionBlockJob = {
      blockID: notionBlock.id,
    };
    await this.apiQueue.add(JOBS.FETCH_NOTION_BLOCK, fetchNotionBlockJob);
  }

  private async enqueueSendDiscordMessageJob(
    event: NotionPageUpdatedEvent,
  ): Promise<void> {
    const sendDiscordMessageJob: SendDiscordMessageJob = {
      channel: ChannelName.logging,
      message: `**notion page updated** - ${event.content.title}`,
    };
    await this.discordQueue.add(
      JOBS.SEND_DISCORD_MESSAGE,
      sendDiscordMessageJob,
      JOBS.OPTIONS.RETRIED,
    );
  }
}
