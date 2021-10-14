import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Command, Option } from 'nestjs-command';
import { Owner } from 'src/owners/entities/owner.entity';
import { Repository } from 'typeorm';
import { OwnerFactory } from '../factories/owner.factory';

@Injectable()
export class SeedDBCommand {
  constructor(
    private ownerFactory: OwnerFactory,
    @InjectRepository(Owner) private ownersRepository: Repository<Owner>,
  ) {
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

    const owners = [];
    for (let i = 0; i < count; i++) {
      owners.push(this.ownerFactory.makeOwner());
    }

    await this.ownersRepository.save(owners);
  }
}
