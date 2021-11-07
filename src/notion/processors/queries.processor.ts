import { Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { NotionService } from '../notion.service';
import {
  PageCreatedEvent,
  PageDeletedEvent,
  PageUpdatedEvent,
} from '../events';
import { QUEUES, JOBS, EVENTS } from '../constants';

@Processor(QUEUES.NOTION_API_QUERIES)
export class NotionQueriesProcessor {
  private readonly logger = new Logger(NotionQueriesProcessor.name);
  constructor(
    private notionService: NotionService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Process(JOBS.SYNC_NOTION)
  async syncNotion() {
    this.logger.debug(`Started processing ${JOBS.SYNC_NOTION} job`);

    try {
      const [notionPages, databasePages] = await Promise.all([
        this.notionService.getPages(),
        this.getContentFromDB(),
      ]);
      // this.logger.debug(JSON.stringify(notionPages));
      // this.logger.debug(JSON.stringify(databasePages));

      // Emit events
      this.emitPageCreated();
      this.emitPageUpdated();
      this.emitPageDeleted();

      //
    } catch (error) {
      this.logger.error(`Error in ${JOBS.SYNC_NOTION} ${error}`);
    }
  }

  private emitPageCreated() {
    const pageCreatedEvent = new PageCreatedEvent();
    pageCreatedEvent.notion_id = 'notion id';
    pageCreatedEvent.lastEditedAt = 'last edited at';
    pageCreatedEvent.title = 'title';
    pageCreatedEvent.type = 'lesson';

    this.eventEmitter.emitAsync(EVENTS.PAGE_CREATED, pageCreatedEvent);
  }

  private emitPageUpdated() {
    const pageUpdatedEvent = new PageUpdatedEvent();
    pageUpdatedEvent.notion_id = 'notion id';
    pageUpdatedEvent.lastEditedAt = 'last edited at';
    pageUpdatedEvent.title = 'title';
    pageUpdatedEvent.type = 'lesson';

    this.eventEmitter.emitAsync(EVENTS.PAGE_UPDATED, pageUpdatedEvent);
  }

  private emitPageDeleted() {
    const pageDeletedEvent = new PageDeletedEvent();
    pageDeletedEvent.notion_id = 'notion id';

    this.eventEmitter.emitAsync(EVENTS.PAGE_DELETED, pageDeletedEvent);
  }

  private async getContentFromDB() {
    return this.sleep(3000).then(() => {
      return [
        {
          id: 1,
          notion_id: '0c73cdcb-ad0b-4f47-842d-bde407cbb81e',
          lastEditedAt: '2021-11-02T20:14:00.000Z',
          type: 'lesson',
          title: 'Lesson Two',
        },
        {
          id: 2,
          notion_id: '9dd90a4c-58bb-436d-8a7f-adca881c3215',
          lastEditedAt: '2021-11-04T11:54:00.000Z',
          type: 'exercise',
          title: 'Exercise One',
        },
        {
          id: 3,
          notion_id: '32f296a5-b364-4b1b-a4b1-e2f518b5ca1d',
          lastEditedAt: '2021-11-02T17:04:00.000Z',
          type: 'lesson',
          title: 'Lesson One',
        },
      ];
    });
  }

  sleep = (ms = 1000) =>
    new Promise((res) => {
      setTimeout(() => {
        res('');
      }, ms);
    });
}
