import { Module } from '@nestjs/common';
import { SeedDBCommand } from './seed.command';
import { CommandModule } from 'nestjs-command';
import { OwnerFactory } from '../factories/owner.factory';
import { Owner } from 'src/owners/owner.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetFactory } from '../factories/pet.factory';
import { Pet } from 'src/pets/pet.entity';
import { SeedDBService } from './seed.service';
import { UserFactory } from '../factories/user.factory';
import { User } from 'src/users/user.entity';
import { UsersModule } from 'src/users/users.module';

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
