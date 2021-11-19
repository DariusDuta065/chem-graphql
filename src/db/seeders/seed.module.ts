import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

import { User } from 'src/user/user.entity';

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
