import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotionAPIService, NotionBlockService } from './services';
import { NotionAPIProcessor, NotionBlockProcessor } from './processors';

import { QUEUES } from 'src/shared/queues';
import { NotionBlock } from './notion-block.entity';
import { ContentModule } from 'src/content/content.module';

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

    ContentModule,
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
