import { Injectable, ConsoleLogger, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Command, Option } from 'nestjs-command';
import { Owner } from 'src/owners/entities/owner.entity';
import { Pet } from 'src/pets/pet.entity';
import { Repository } from 'typeorm';
import { OwnerFactory } from '../factories/owner.factory';
import { PetFactory } from '../factories/pet.factory';

@Injectable()
export class SeedDBCommand {
  private readonly logger = new Logger(SeedDBCommand.name);

  constructor(
    private ownerFactory: OwnerFactory,
    private petFactory: PetFactory,
    @InjectRepository(Owner) private ownersRepository: Repository<Owner>,
    @InjectRepository(Pet) private petsRepository: Repository<Pet>,
  ) {}

  @Command({
    command: 'seed:db',
    describe: 'seed db with mock data',
  })
  async seedData() {
    console.log('Seeding DB');
  }

  @Command({
    command: 'seed:owners',
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
    this.logger.warn('Seeding owners');

    if (!Number.isInteger(count)) {
      count = Math.round(count);
    }

    const owners = [];
    for (let i = 0; i < count; i++) {
      owners.push(this.ownerFactory.makeOwner());
    }

    await this.ownersRepository.save(owners);
  }

  @Command({
    command: 'seed:pets',
    describe: 'seed pets table',
  })
  async seedPets(
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
    this.logger.log('Seeding pets');

    if (!Number.isInteger(count)) {
      count = Math.round(count);
    }

    const owners = await this.ownersRepository.find();
    console.log(owners);

    const pets = [];
    for (let i = 0; i < count; i++) {
      pets.push(
        this.petFactory.makePet({
          owner: owners[Math.floor(Math.random() * owners.length - 1)],
        }),
      );
    }

    await this.petsRepository.save(pets);
  }
}
