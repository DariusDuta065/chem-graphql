import { join } from 'path';

import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule, Module } from '@nestjs/common';

import * as redisStore from 'cache-manager-redis-store';

import { AppService } from './app.service';
import { AppController } from './app.controller';

import { AuthModule } from './auth/auth.module';
import { PetsModule } from './pets/pets.module';
import { UsersModule } from './users/users.module';
import { OwnersModule } from './owners/owners.module';
import { SeedDBModule } from './db/seeders/seed.module';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    TypeOrmModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 0,
    }),

    AuthModule,
    PetsModule,
    UsersModule,
    OwnersModule,
    SeedDBModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
