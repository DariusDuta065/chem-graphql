import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Content } from './content.entity';
import { ContentService } from './content.service';
import { QUEUES } from '../shared/queues';
import { ContentProcessor } from './content.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Content]),
    BullModule.registerQueue({
      name: QUEUES.CONTENT,
    }),
  ],
  providers: [ContentService, ContentProcessor],
  exports: [ContentService],
})
export class ContentModule {}
