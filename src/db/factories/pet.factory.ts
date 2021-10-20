import * as faker from 'faker';
import { Injectable } from '@nestjs/common';

import { Pet } from '../../pets/pet.entity';
import { Owner } from '../../owners/owner.entity';

@Injectable()
export class PetFactory {
  //

  makePet(petData: PetData) {
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
