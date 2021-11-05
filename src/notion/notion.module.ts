import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

import { NotionService } from './notion.service';
import { NotionProcessor } from './processors';

import { QUEUES } from './constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUES.NOTION,
      // https://developers.notion.com/reference/errors#rate-limits
      // limiter: {}
    }),
  ],
  providers: [ConfigService, NotionService, NotionProcessor],
})
export class NotionModule {}
