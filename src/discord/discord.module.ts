import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';

import { QUEUES } from 'src/shared/queues';
import { DiscordService } from './discord.service';
import { DiscordProcessor } from './discord.processor';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
    }),
    BullModule.registerQueue({
      name: QUEUES.DISCORD,
      // https://discord.com/developers/docs/topics/rate-limits
      limiter: {
        max: 1, // max 1 req per sec
        duration: 1000,
      },
      defaultJobOptions: {
        removeOnComplete: QUEUES.MAX_ITEMS_IN_QUEUE,
      },
    }),
  ],
  providers: [DiscordProcessor, DiscordService],
})
export class DiscordModule {}
