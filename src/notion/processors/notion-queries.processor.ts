import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';

import { SyncNotionJob } from '../jobs';
import { QUEUES, JOBS } from '../constants';
import { NotionService } from '../notion.service';

@Processor(QUEUES.NOTION)
export class NotionProcessor {
  private readonly logger = new Logger(NotionProcessor.name);

  constructor(private notionService: NotionService) {}

  @Process(JOBS.SYNC_NOTION)
  async syncNotion(job: Job<SyncNotionJob>) {
    this.logger.debug('Started processing job');

    try {
      const [notionPages, databasePages] = await Promise.all([
        this.notionService.getPages(),
        this.getContentFromDB(),
      ]);

      this.logger.debug(JSON.stringify(notionPages));
      this.logger.debug(JSON.stringify(databasePages));
    } catch (error) {
      this.logger.error(`Error in ${JOBS.SYNC_NOTION} ${error}`);
    }
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
