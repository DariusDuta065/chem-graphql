import { Job } from 'bull';

import { Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';

import { JOBS, SendDiscordMessageJob } from 'src/shared/jobs';
import { QUEUES } from 'src/shared/queues';

import { DiscordService } from './discord.service';

@Processor(QUEUES.DISCORD)
export class DiscordProcessor {
  private readonly logger = new Logger(DiscordProcessor.name);

  constructor(private discordService: DiscordService) {}

  @Process(JOBS.SEND_DISCORD_MESSAGE)
  public sendDiscordMessageJob({ data }: Job<SendDiscordMessageJob>): void {
    this.discordService.sendMessage(data.channel, data.message);
  }
}
