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
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';

import { AppController } from './app.controller';

import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { GroupModule } from 'src/group/group.module';
import { NotionModule } from 'src/notion/notion.module';
import { SeedDBModule } from 'src/db/seeders/seed.module';
import { ContentModule } from 'src/content/content.module';
import { DiscordModule } from 'src/discord/discord.module';

import configuration from 'src/config/configuration';
import { BullConfigService } from 'src/config/services/bullConfigService';
import { CacheConfigService } from 'src/config/services/cacheConfigService';
import { TypeOrmConfigService } from 'src/config/services/typeOrmConfigService';

@Module({
  imports: [
    ScheduleModule.forRoot(),

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
      introspection: true,
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
    DiscordModule,

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
