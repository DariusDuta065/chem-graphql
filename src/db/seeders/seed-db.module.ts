import { Module } from '@nestjs/common';
import { SeedDBCommand } from './seed-db.command';
import { CommandModule } from 'nestjs-command';
import { OwnerFactory } from '../factories/owner.factory';
import { Owner } from 'src/owners/entities/owner.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [CommandModule, TypeOrmModule.forFeature([Owner])],
  providers: [SeedDBCommand, OwnerFactory],
})
export class SeedDBModule {}
