import * as faker from 'faker';
import { Injectable } from '@nestjs/common';

import { Owner } from '../../owners/owner.entity';

@Injectable()
export class OwnerFactory {
  //

  makeOwner(ownerData?: Owner) {
    const owner = new Owner();
    owner.name = ownerData?.name ?? faker.name.firstName();

    return owner;
  }
}
