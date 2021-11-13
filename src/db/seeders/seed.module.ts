import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../../auth/auth.module';
import { UserModule } from '../../user/user.module';

import { User } from '../../user/user.entity';

import { SeedDBCommand } from './seed.command';
import { SeedDBService } from './seed.service';

@Module({
  imports: [
    UserModule,
    AuthModule,
    CommandModule,
    TypeOrmModule.forFeature([User]),
  ],
  providers: [SeedDBCommand, SeedDBService],
})
export class SeedDBModule {}
