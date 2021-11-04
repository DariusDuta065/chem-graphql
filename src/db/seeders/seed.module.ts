import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../../users/users.module';

import { User } from '../../users/user.entity';

import { SeedDBCommand } from './seed.command';
import { SeedDBService } from './seed.service';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    CommandModule,
    TypeOrmModule.forFeature([User]),
  ],
  providers: [SeedDBCommand, SeedDBService],
})
export class SeedDBModule {}
