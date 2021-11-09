import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

import {
  PageCreatedListener,
  PageUpdatedListener,
  PageDeletedListener,
} from './listeners';
import { NotionAPIService, NotionBlockService } from './services';
import { NotionJobsProcessor, NotionQueriesProcessor } from './processors';

import { QUEUES } from './constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotionBlock } from './notion-block.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotionBlock]),

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
    NotionAPIService,
    NotionBlockService,

    NotionJobsProcessor,
    NotionQueriesProcessor,

    PageCreatedListener,
    PageUpdatedListener,
    PageDeletedListener,
  ],
})
export class NotionModule {}
