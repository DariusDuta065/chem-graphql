import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

import { NotionService } from './notion.service';

import { NotionJobsProcessor, NotionQueriesProcessor } from './processors';
import {
  PageCreatedListener,
  PageUpdatedListener,
  PageDeletedListener,
} from './listeners';

import { QUEUES } from './constants';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: QUEUES.NOTION_API_QUERIES,
        // https://developers.notion.com/reference/errors#rate-limits
        limiter: {
          max: 3, // max 3 req per sec
          duration: 1000,
        },
      },
      {
        name: QUEUES.NOTION_JOBS,
      },
    ),
  ],
  providers: [
    ConfigService,
    NotionService,

    NotionJobsProcessor,
    NotionQueriesProcessor,

    PageCreatedListener,
    PageUpdatedListener,
    PageDeletedListener,
  ],
})
export class NotionModule {}
