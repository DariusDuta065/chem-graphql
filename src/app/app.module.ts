import { join } from 'path';
import { Cache } from 'cache-manager';

import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import {
  Inject,
  Module,
  CacheModule,
  CACHE_MANAGER,
  OnModuleDestroy,
} from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';

import { AppController } from './app.controller';

import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { GroupModule } from '../group/group.module';
import { NotionModule } from '../notion/notion.module';
import { SeedDBModule } from '../db/seeders/seed.module';
import { ContentModule } from '../content/content.module';

import configuration from '../config/configuration';
import { BullConfigService } from '../config/services/bullConfigService';
import { CacheConfigService } from '../config/services/cacheConfigService';
import { TypeOrmConfigService } from '../config/services/typeOrmConfigService';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),

    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [configuration],
      envFilePath: `env/${process.env.NODE_ENV}.env`,
    }),

    GraphQLModule.forRoot({
      sortSchema: true,
      playground: false,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),

    BullModule.forRootAsync({
      useClass: BullConfigService,
    }),

    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      useClass: CacheConfigService,
    }),

    AuthModule,
    UserModule,
    ContentModule,
    GroupModule,

    NotionModule,

    SeedDBModule,
  ],
  controllers: [AppController],
})
export class AppModule implements OnModuleDestroy {
  //

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  public onModuleDestroy(): void {
    // Manually close Redis client, to not have TCP handle leak
    const client = (this.cacheManager.store as any).getClient();
    client.quit();
  }
}
