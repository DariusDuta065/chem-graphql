import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../../users/users.module';

import { Owner } from '../../owners/owner.entity';
import { Pet } from '../../pets/pet.entity';
import { User } from '../../users/user.entity';

import { SeedDBCommand } from './seed.command';
import { SeedDBService } from './seed.service';

import { PetFactory } from '../factories/pet.factory';
import { UserFactory } from '../factories/user.factory';
import { OwnerFactory } from '../factories/owner.factory';

@Module({
  imports: [
    UsersModule,
    CommandModule,
    TypeOrmModule.forFeature([Owner, Pet, User]),
  ],
  providers: [
    SeedDBCommand,
    OwnerFactory,
    PetFactory,
    UserFactory,
    SeedDBService,
  ],
})
export class SeedDBModule {}
