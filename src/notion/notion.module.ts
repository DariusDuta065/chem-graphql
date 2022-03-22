import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotionAPIService, NotionBlockService } from './services';
import { NotionAPIProcessor, NotionBlockProcessor } from './processors';

import { QUEUES } from 'src/shared/queues';
import { EventHandlers } from './events/handlers';
import { NotionBlock } from './notion-block.entity';
import { ContentModule } from 'src/content/content.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotionBlock]),
    CqrsModule,

    BullModule.registerQueue(
      {
        name: QUEUES.NOTION_API,
        // https://developers.notion.com/reference/errors#rate-limits
        limiter: {
          max: 3, // max 3 req per sec
          duration: 1000,
        },
        defaultJobOptions: {
          removeOnComplete: QUEUES.MAX_ITEMS_IN_QUEUE,
        },
      },
      {
        name: QUEUES.NOTION_BLOCKS,
        defaultJobOptions: {
          removeOnComplete: QUEUES.MAX_ITEMS_IN_QUEUE,
        },
      },
      {
        name: QUEUES.CONTENT,
        defaultJobOptions: {
          removeOnComplete: QUEUES.MAX_ITEMS_IN_QUEUE,
        },
      },
      {
        name: QUEUES.DISCORD,
        // https://discord.com/developers/docs/topics/rate-limits
        limiter: {
          max: 10, // max 50 req per sec
          duration: 1000,
        },
        defaultJobOptions: {
          removeOnComplete: QUEUES.MAX_ITEMS_IN_QUEUE,
        },
      },
    ),

    ContentModule,
  ],
  providers: [
    ConfigService,
    NotionAPIService,
    NotionBlockService,

    NotionAPIProcessor,
    NotionBlockProcessor,

    ...EventHandlers,
  ],
})
export class NotionModule {}
