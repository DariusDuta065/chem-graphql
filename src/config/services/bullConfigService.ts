import { QueueOptions } from 'bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SharedBullConfigurationFactory } from '@nestjs/bull';

import { RedisConfig } from '../interfaces/RedisConfig';

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
  constructor(private configService: ConfigService) {}

  public createSharedConfiguration(): QueueOptions {
    const config: RedisConfig = this.configService.get<RedisConfig>(
      RedisConfig.CONFIG_KEY,
      { infer: true },
    );

    return {
      redis: config,
    };
  }
}
