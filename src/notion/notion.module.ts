import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

import { NotionAPIService, NotionBlockService } from './services';
import { NotionAPIProcessor, NotionBlockProcessor } from './processors';

import { QUEUES } from '../shared/queues';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotionBlock } from './notion-block.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotionBlock]),

    BullModule.registerQueue(
      {
        name: QUEUES.NOTION_API,
        // https://developers.notion.com/reference/errors#rate-limits
        limiter: {
          max: 3, // max 3 req per sec
          duration: 1000,
        },
      },
      {
        name: QUEUES.NOTION_BLOCKS,
      },
      {
        name: QUEUES.CONTENT,
      },
    ),
  ],
  providers: [
    ConfigService,
    NotionAPIService,
    NotionBlockService,

    NotionAPIProcessor,
    NotionBlockProcessor,
  ],
})
export class NotionModule {}
