import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { QUEUES } from 'src/shared/queues';
import { DeleteContentJob, JOBS } from 'src/shared/jobs';
import { NotionPageDeletedEvent } from 'src/notion/events';

@EventsHandler(NotionPageDeletedEvent)
export class NotionPageDeletedHandler
  implements IEventHandler<NotionPageDeletedEvent>
{
  constructor(
    @InjectQueue(QUEUES.CONTENT)
    private contentQueue: Queue,
  ) {}

  public async handle(event: NotionPageDeletedEvent): Promise<void> {
    await this.enqueueDeleteContentJob(event);
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
}
