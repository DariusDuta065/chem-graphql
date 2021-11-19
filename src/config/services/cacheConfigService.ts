import {
  CacheModuleOptions,
  CacheOptionsFactory,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

import { RedisConfig } from '../interfaces/RedisConfig';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private configService: ConfigService) {}

  public createCacheOptions(): CacheModuleOptions {
    const dbConfig: RedisConfig = this.configService.get<RedisConfig>(
      RedisConfig.CONFIG_KEY,
      { infer: true },
    );

    return {
      isGlobal: true,
      ttl: dbConfig.ttl,
      host: dbConfig.host,
      port: dbConfig.port,
      store: redisStore,
    };
  }
}
