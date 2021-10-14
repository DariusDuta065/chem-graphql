import { Injectable } from '@nestjs/common';
import { Owner } from 'src/owners/owner.entity';
import * as faker from 'faker';

@Injectable()
export class OwnerFactory {
  //

  makeOwner(ownerData?: Owner) {
    const owner = new Owner();
    owner.name = ownerData?.name ?? faker.name.firstName();

    return owner;
  }
}
