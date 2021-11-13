import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './user.entity';
import { Role } from '../auth/enums/role.enum';
import { UserRegisterInput } from '../auth/dto/user-register.input';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  public async findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ email });
  }

  public async findOneByID(userId: number | string): Promise<User | undefined> {
    return this.usersRepository.findOne({ userId: Number(userId) });
  }

  /**
   * Ensures provided email is unique,
   * then saves the user to DB.
   *
   * @param input
   * @param cleartextPass
   * @param hashedPass
   * @returns {User}
   * @throws {Error}
   */
  public async registerUser(
    input: UserRegisterInput,
    cleartextPass: string,
    hashedPass: string,
  ): Promise<User> {
    // Check for duplicate users
    const userExists = await this.findOneByEmail(input.email);
    if (userExists) {
      throw new Error('User already exists');
    }

    const user = new User();
    user.email = input.email;
    user.lastName = input.lastName;
    user.firstName = input.firstName;
    user.role = input.role ?? Role.User;
    user.password = hashedPass;

    const newUser = await this.usersRepository.save(user);
    return { ...newUser, password: cleartextPass };
  }

  /**
   * Updates password for users and returns the entity.
   *
   * @param userID
   * @param password
   * @returns {User}
   * @throws {EntityNotFoundError}
   */
  public async updateUserPassword(
    userID: number,
    password: string,
  ): Promise<User> {
    const user = await this.usersRepository.findOneOrFail(userID);
    user.password = password;

    return this.usersRepository.save(user);
  }
}
