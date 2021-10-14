import { Injectable } from '@nestjs/common';
import { Pet } from 'src/pets/pet.entity';
import * as faker from 'faker';
import { Owner } from 'src/owners/entities/owner.entity';

@Injectable()
export class PetFactory {
  //

  makePet(petData?: PetData) {
    const pet = new Pet();
    pet.name = petData?.name ?? faker.name.firstName();
    pet.type = petData?.type ?? faker.random.arrayElement(['dog', 'cat']);
    pet.owner = petData.owner;

    return pet;
  }
}

interface PetData {
  name?: string;
  type?: string;
  owner: Owner;
}
