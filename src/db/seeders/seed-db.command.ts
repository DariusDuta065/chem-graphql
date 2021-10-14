import { Injectable } from '@nestjs/common';
import { Command, Option } from 'nestjs-command';
import { OwnerFactory } from '../factories/owner.factory';

@Injectable()
export class SeedDBCommand {
  constructor(private ownerFactory: OwnerFactory) {
    console.log('Owner seeder');
  }

  @Command({
    command: 'seed:db',
    describe: 'seed db with mock data',
  })
  async seedData() {
    console.log('Seeding DB');
  }

  @Command({
    command: 'seed:owner',
    describe: 'seed owners table',
  })
  async seedOwners(
    @Option({
      name: 'count',
      describe: 'how many entities to be created',
      type: 'number',
      alias: 'n',
      required: false,
      default: 10,
    })
    count: number,
  ) {
    console.log('Seeding owners');

    if (!Number.isInteger(count)) {
      count = Math.round(count);
    }

    for (let i = 0; i < count; i++) {
      const owner = this.ownerFactory.makeOwner();
      console.log('owner', owner);
    }
  }
}
