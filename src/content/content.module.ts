import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from 'src/user/user.entity';
import { Content } from './content.entity';
import { NotionBlock } from 'src/notion/notion-block.entity';

import { ContentService } from './content.service';
import { ContentProcessor } from './content.processor';

import { QUEUES } from 'src/shared/queues';
import { ContentResolver } from './content.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Content, NotionBlock, User]),
    BullModule.registerQueue(
      {
        name: QUEUES.CONTENT,
        defaultJobOptions: {
          removeOnComplete: QUEUES.MAX_ITEMS_IN_QUEUE,
        },
      },
      {
        name: QUEUES.NOTION_API,
        // https://developers.notion.com/reference/errors#rate-limits
        limiter: {
          max: 2, // max 2 req per sec
          duration: 1000,
        },
        defaultJobOptions: {
          removeOnComplete: QUEUES.MAX_ITEMS_IN_QUEUE,
        },
      },
    ),
  ],
  providers: [ContentService, ContentProcessor, ContentResolver],
  exports: [ContentService],
})
export class ContentModule {}
