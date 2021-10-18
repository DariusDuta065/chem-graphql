import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserData } from 'src/users/dto/userData.output';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<UserData | null> {
    const user = await this.usersService.findOneByEmail(username);

    if (user && user.password === pass) {
      return UserData.fromUser(user);
    }
    return null;
  }

  /**
   * Creates and signs a JWT token from UserData.
   * @param {UserData} user
   * @returns JWT token
   */
  async login(user: UserData): Promise<string> {
    const payload = { sub: user.id, ...user };
    return this.jwtService.sign(payload);
  }

  decodeUserId(token: string): number | null {
    const decoded = this.jwtService.decode(token);

    if (decoded && typeof decoded === 'object' && decoded.sub) {
      return Number(decoded.sub);
    }

    return null;
  }
}
