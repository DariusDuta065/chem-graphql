import { Module } from '@nestjs/common';
import { SeedDBCommand } from './seed-db.command';
import { CommandModule } from 'nestjs-command';
import { OwnerFactory } from '../factories/owner.factory';
import { Owner } from 'src/owners/entities/owner.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetFactory } from '../factories/pet.factory';
import { Pet } from 'src/pets/pet.entity';

@Module({
  imports: [CommandModule, TypeOrmModule.forFeature([Owner, Pet])],
  providers: [SeedDBCommand, OwnerFactory, PetFactory],
})
export class SeedDBModule {}
