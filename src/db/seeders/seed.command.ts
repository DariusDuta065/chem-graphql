import { Injectable } from '@nestjs/common';
import { Command, Option } from 'nestjs-command';
import { SeedDBService } from './seed.service';

@Injectable()
export class SeedDBCommand {
  constructor(private seedDbService: SeedDBService) {}

  @Command({
    command: 'seed:db',
    describe: 'seed db with mock data',
  })
  async seedData() {
    await this.seedDbService.seedOwners(10);
    await this.seedDbService.seedPets(20);
    await this.seedDbService.seedUsers(5);
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
    await this.seedDbService.seedOwners(count);
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
    await this.seedDbService.seedPets(count);
  }

  @Command({
    command: 'seed:users',
    describe: 'seed users table',
  })
  async seedUsers(
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
    await this.seedDbService.seedUsers(count);
  }
}
