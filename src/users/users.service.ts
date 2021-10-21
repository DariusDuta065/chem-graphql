import { Repository } from 'typeorm';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './user.entity';
import { Role } from '../auth/enums/role.enum';
import { UserRegisterInput } from '../auth/dto/user-register.input';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ email });
  }

  async findOneByID(userId: number | string): Promise<User | undefined> {
    return this.usersRepository.findOne({ userId: Number(userId) });
  }

  async registerUser(
    input: UserRegisterInput,
    cleartextPass: string,
    hashedPass: string,
  ): Promise<User> {
    // Check for duplicate users
    const userExists = await this.findOneByEmail(input.email);
    if (userExists) {
      throw new ConflictException('User already exists');
    }

    const user = new User();
    user.email = input.email;
    user.lastName = input.lastName;
    user.firstName = input.firstName;
    user.role = input.role ?? Role.User;
    user.password = hashedPass;

    const resUser = await this.usersRepository.save(user);
    resUser.password = cleartextPass;
    return resUser;
  }
}
