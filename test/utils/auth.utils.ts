import * as faker from 'faker';
import { Injectable } from '@nestjs/common';

import { User } from 'src/user/user.entity';
import { Role } from 'src/auth/enums/role.enum';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { UserRegisterInput } from 'src/auth/dto/user-register.input';

@Injectable()
export class AuthUtils {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error(`Use TestUtils only in the 'test' env`);
    }
  }

  /**
   * Registers a new user *or* re-uses existing one
   * and logins them in order to obtain the access
   * and refresh tokens. Also returns the User object.
   * @param userData
   * @returns pair of tokens & user
   */
  public async getTokens(userData?: {
    userId?: number;
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    role?: Role;
  }): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    let user: User;

    const userID = userData?.userId;

    if (!userID) {
      user = await this.createUser(userData);
    } else {
      const existingUser = await this.userService.getUserByID(userID);

      if (!existingUser) {
        user = await this.createUser(userData);
      } else {
        user = existingUser;
      }
    }

    const tokens = await this.authService.login({
      ...user,
    });

    if (!tokens || !tokens.accessToken) {
      throw new Error('could not get access token for user');
    }
    return {
      ...tokens,
      user,
    };
  }

  public async createUser(user?: {
    userId?: number;
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    role?: Role;
  }): Promise<User> {
    const registerInput: UserRegisterInput = {
      email: user?.email ?? faker.internet.email(),
      firstName: user?.firstName ?? faker.name.firstName(),
      lastName: user?.lastName ?? faker.name.lastName(),
      password: user?.password ?? faker.internet.password(),
      role: user?.role ?? Role.User,
    };

    const newUser = await this.authService.register(registerInput);
    if (!newUser) {
      throw new Error('could not create new user');
    }
    return newUser;
  }
}
