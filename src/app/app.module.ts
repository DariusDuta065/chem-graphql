import { join } from 'path';

import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule, Module } from '@nestjs/common';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';

import { AppController } from './app.controller';

import { AuthModule } from '../auth/auth.module';
import { PetsModule } from '../pets/pets.module';
import { UsersModule } from '../users/users.module';
import { OwnersModule } from '../owners/owners.module';
import { SeedDBModule } from '../db/seeders/seed.module';

import configuration from '../config/configuration';
import { CacheConfigService } from '../config/services/cacheConfigService';
import { TypeOrmConfigService } from '../config/services/typeOrmConfigService';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [configuration],
    }),

    GraphQLModule.forRoot({
      sortSchema: true,
      playground: false,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),

    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      useClass: CacheConfigService,
    }),

    AuthModule,
    PetsModule,
    UsersModule,
    OwnersModule,
    SeedDBModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
