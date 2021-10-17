import { join } from 'path';

import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

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
