import { Module } from '@nestjs/common';
import { SeedDBCommand } from './seed-db.command';
import { CommandModule } from 'nestjs-command';
import { OwnerFactory } from '../factories/owner.factory';

@Module({
  imports: [CommandModule],
  providers: [SeedDBCommand, OwnerFactory],
})
export class SeedDBModule {}
