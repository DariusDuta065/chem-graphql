import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Owner } from 'src/owners/owner.entity';
import { Pet } from 'src/pets/pet.entity';

import { OwnerFactory } from '../factories/owner.factory';
import { PetFactory } from '../factories/pet.factory';
import { UserFactory } from '../factories/user.factory';
import { User } from 'src/users/user.entity';

@Injectable()
export class SeedDBService {
  private readonly logger = new Logger(SeedDBService.name);

  constructor(
    @InjectRepository(Owner) private ownersRepository: Repository<Owner>,
    @InjectRepository(Pet) private petsRepository: Repository<Pet>,
    @InjectRepository(User) private usersRepository: Repository<User>,

    private ownerFactory: OwnerFactory,
    private petFactory: PetFactory,
    private userFactory: UserFactory,
  ) {}

  async seedOwners(count: number) {
    this.logger.log('Seeding owners');

    if (!Number.isInteger(count)) {
      count = Math.round(count);
    }

    const owners = [];
    for (let i = 0; i < count; i++) {
      owners.push(this.ownerFactory.makeOwner());
    }

    await this.ownersRepository.save(owners);
  }

  async seedPets(count: number) {
    this.logger.log('Seeding pets');

    if (!Number.isInteger(count)) {
      count = Math.round(count);
    }

    const owners = await this.ownersRepository.find();
    const randomInt = (min, max) =>
      Math.floor(Math.random() * (max - min + 1) + min);

    const pets = [];
    for (let i = 0; i < count; i++) {
      const ownerId = randomInt(1, owners.length - 1);
      pets.push(
        this.petFactory.makePet({
          owner: owners[ownerId],
        }),
      );
    }

    await this.petsRepository.save(pets);
  }

  async seedUsers(count: number) {
    this.logger.log('Seeding usrs');

    if (!Number.isInteger(count)) {
      count = Math.round(count);
    }

    const users = [];
    for (let i = 0; i < count; i++) {
      users.push(this.userFactory.makeUser());
    }

    await this.usersRepository.save(users);
  }
}
