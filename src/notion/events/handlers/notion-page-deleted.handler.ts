import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { QUEUES } from 'src/shared/queues';
import { NotionPageDeletedEvent } from 'src/notion/events';
import {
  JOBS,
  ChannelName,
  DeleteContentJob,
  SendDiscordMessageJob,
} from 'src/shared/jobs';

@EventsHandler(NotionPageDeletedEvent)
export class NotionPageDeletedHandler
  implements IEventHandler<NotionPageDeletedEvent>
{
  constructor(
    @InjectQueue(QUEUES.CONTENT)
    private contentQueue: Queue,
    @InjectQueue(QUEUES.DISCORD)
    private discordQueue: Queue,
  ) {}

  public async handle(event: NotionPageDeletedEvent): Promise<void> {
    await this.enqueueDeleteContentJob(event);
    await this.enqueueSendDiscordMessageJob(event);
  }

  private async enqueueDeleteContentJob(
    event: NotionPageDeletedEvent,
  ): Promise<void> {
    const { content } = event;

    const deleteContentJob: DeleteContentJob = {
      blockID: content.blockID,
    };
    await this.contentQueue.add(JOBS.DELETE_CONTENT, deleteContentJob);
  }

  private async enqueueSendDiscordMessageJob(
    event: NotionPageDeletedEvent,
  ): Promise<void> {
    const sendDiscordMessageJob: SendDiscordMessageJob = {
      channel: ChannelName.logging,
      message: `**notion page deleted** - ${event.content.title}`,
    };
    await this.discordQueue.add(
      JOBS.SEND_DISCORD_MESSAGE,
      sendDiscordMessageJob,
      JOBS.OPTIONS.RETRIED,
    );
  }
}
