import { Repository } from 'typeorm';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './user.entity';
import { Role } from '../auth/enums/role.enum';
import { UserRegisterInput } from '../auth/dto/user-register.input';

import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

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

  async registerUser(input: UserRegisterInput): Promise<User> {
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

    // Handle password
    const clearTextPass = input.password ?? this.generatePassword();
    user.password = this.hashPassword(clearTextPass);

    const resUser = await this.usersRepository.save(user);
    resUser.password = clearTextPass;
    return resUser;
  }

  generatePassword(
    length = 8,
    wishlist = '0123456789abcdefghijklmnopqrstuvwxyz',
  ) {
    return Array.from(crypto.randomFillSync(new Uint32Array(length)))
      .map((x) => wishlist[x % wishlist.length])
      .join('');
  }

  hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }
}
