import { Module } from '@nestjs/common';
import { SeedDBCommand } from './seed.command';
import { CommandModule } from 'nestjs-command';
import { OwnerFactory } from '../factories/owner.factory';
import { Owner } from 'src/owners/owner.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetFactory } from '../factories/pet.factory';
import { Pet } from 'src/pets/pet.entity';
import { SeedDBService } from './seed.service';

@Module({
  imports: [CommandModule, TypeOrmModule.forFeature([Owner, Pet])],
  providers: [SeedDBCommand, OwnerFactory, PetFactory, SeedDBService],
})
export class SeedDBModule {}
