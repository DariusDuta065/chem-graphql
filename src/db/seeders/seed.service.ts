import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConflictException, Injectable, Logger } from '@nestjs/common';

import { User } from 'src/user/user.entity';
import { AuthService } from 'src/auth/auth.service';

import { CreateUserInput } from './dto/create-user.input';

@Injectable()
export class SeedDBService {
  private readonly logger = new Logger(SeedDBService.name);

  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private authService: AuthService,
  ) {}

  public async createUser(userInput: CreateUserInput): Promise<void> {
    try {
      await this.authService.register(userInput);
    } catch (err) {
      if (err instanceof ConflictException) {
        this.logger.error(err.message);
      } else {
        this.logger.error(err);
      }
    }
  }
}
