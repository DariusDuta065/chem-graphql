import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Owner } from 'src/owners/owner.entity';
import { Pet } from 'src/pets/pet.entity';

import { OwnerFactory } from '../factories/owner.factory';
import { PetFactory } from '../factories/pet.factory';

@Injectable()
export class SeedDBService {
  private readonly logger = new Logger(SeedDBService.name);

  constructor(
    @InjectRepository(Owner) private ownersRepository: Repository<Owner>,
    @InjectRepository(Pet) private petsRepository: Repository<Pet>,

    private ownerFactory: OwnerFactory,
    private petFactory: PetFactory,
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
}
