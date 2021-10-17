import { Injectable, Logger } from '@nestjs/common';
import { Command, Option } from 'nestjs-command';
import { CreateUserInput } from './dto/create-user.input';
import { SeedDBService } from './seed.service';
import { validate } from 'class-validator';

@Injectable()
export class SeedDBCommand {
  private readonly logger = new Logger(SeedDBService.name);

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

  @Command({
    command: 'create:user',
    describe: 'create an user',
  })
  async createUser(
    @Option({
      name: 'username',
      alias: 'u',
      required: true,
    })
    username: string,
    @Option({
      name: 'password',
      alias: 'p',
      describe: 'cleartext password of new user',
      required: true,
    })
    password: string,
  ) {
    if (typeof username !== 'string') {
      this.logger.error('Invalid username');
      return;
    }
    if (typeof password !== 'string') {
      this.logger.error('Invalid password');
      return;
    }

    const userInput = new CreateUserInput();
    userInput.username = username;
    userInput.password = password;

    try {
      const errs = await validate(userInput);
      if (errs.length) {
        for (const err of errs) this.logger.error(err);
        return;
      }
    } catch (err) {
      this.logger.error(err);
      return;
    }

    this.logger.log(`Creating user: ${username}`);
    await this.seedDbService.createUser(userInput);
  }
}
