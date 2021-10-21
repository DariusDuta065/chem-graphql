import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { UserData } from '../users/dto/userData.output';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<UserData | null> {
    const user = await this.usersService.findOneByEmail(username);

    if (!user) {
      return null;
    }

    const isMatching = this.isMatching(password, user.password);

    if (isMatching) {
      return UserData.fromUser(user);
    }
    return null;
  }

  /**
   * Creates and signs a JWT token from UserData.
   * @param {UserData} user
   * @returns JWT token
   */
  async login(user: UserData): Promise<{
    accessToken: string;
    refreshToken?: string;
  }> {
    return {
      accessToken: this.jwtService.sign(
        { sub: user.id, ...user },
        { expiresIn: '15m' },
      ),
      refreshToken: Buffer.from(
        this.jwtService.sign({ sub: user.id }, { expiresIn: '30d' }),
      ).toString('base64'),
    };
  }

  decodeUserId(token: string): number | null {
    const decoded = this.jwtService.decode(token);

    if (decoded && typeof decoded === 'object' && decoded.sub) {
      return Number(decoded.sub);
    }

    return null;
  }

  /**
   * Compares hashedPass from DB with user input pass.
   * @param {string} password
   * @param {string} hashedPassword
   * @returns {boolean}
   */
  private isMatching(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }
}
