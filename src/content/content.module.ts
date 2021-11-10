import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Content } from './content.entity';
import { NotionBlock } from '../notion/notion-block.entity';

import { ContentService } from './content.service';
import { ContentProcessor } from './content.processor';

import { QUEUES } from '../shared/queues';

@Module({
  imports: [
    TypeOrmModule.forFeature([Content, NotionBlock]),
    BullModule.registerQueue({
      name: QUEUES.CONTENT,
    }),
  ],
  providers: [ContentService, ContentProcessor],
  exports: [ContentService],
})
export class ContentModule {}
