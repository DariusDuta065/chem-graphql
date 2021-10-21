import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { UserData } from '../users/dto/userData.output';
import { TokenOutput } from './dto/token.output';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,

    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Callback used by Passport's local strategy
   * to validate username & password with the DB
   * @param username
   * @param password
   * @returns {Promise}
   */
  async validateUser(
    username: string,
    password: string,
  ): Promise<UserData | null> {
    const user = await this.usersService.findOneByEmail(username);

    if (!user) {
      return null;
    }

    if (this.isMatching(password, user.password)) {
      return UserData.fromUser(user);
    }
    return null;
  }

  /**
   * Creates and signs a JWT token from UserData.
   * @param {UserData} user
   * @returns JWT token
   */
  async login(user: UserData) {
    const tokens = {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };

    // Save [refreshToken, userID] in Redis
    this.saveRefreshToken(tokens.refreshToken, user.id);
    return tokens;
  }

  /**
   * Basic refresh token rotation approach.
   * The old refresh token will be invalidated, and a new set of access and
   * refresh tokens will be returned.
   *
   * https://auth0.com/docs/security/tokens/refresh-tokens/refresh-token-rotation
   * @param refreshToken
   * @return {Promise} - the 2 new tokens
   * @throws {Error}
   */
  async refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const tokenUserID = this.decodeRefreshToken(refreshToken);
    const redisUserID = await this.getRefreshTokenUserID(refreshToken);

    if (tokenUserID !== redisUserID) {
      throw new Error('Tokens mismatch');
    }

    const user = await this.usersService.findOneByID(redisUserID);
    if (!user) {
      throw new Error('User not found');
    }

    // Invalidate (remove) old refreshToken from Redis
    await this.deleteRefreshToken(refreshToken);

    // Generate a new pair (accessToken, refreshToken)
    return await this.login(UserData.fromUser(user));
  }

  async fetchUserInfo(token: TokenOutput) {
    const userId = this.decodeUserID(token.accesstoken);
    const user = await this.usersService.findOneByID(userId);

    if (!user) {
      throw new Error('User not found');
    }
    return UserData.fromUser(user);
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

  private generateAccessToken(user: UserData) {
    return this.jwtService.sign(
      { sub: user.id, ...user },
      { expiresIn: '15m' },
    );
  }

  private generateRefreshToken(user: UserData) {
    return this.encodeRefreshToken(
      this.jwtService.sign({ sub: user.id }, { expiresIn: '30d' }),
    );
  }

  /**
   * Encodes the refreshToken JWT into base64.
   *
   * @param refreshToken - JWT
   */
  private encodeRefreshToken(refreshToken: string): string {
    return Buffer.from(refreshToken).toString('base64');
  }

  /**
   * Attempts to decode the token given by the user, in order
   * to issue a new one, along with a new access token.
   *
   * @param refreshToken - user-provided token
   * @returns {number} - the UserID from the token
   * @throws {Error}
   */
  private decodeRefreshToken(refreshToken: string): number {
    const jwt = Buffer.from(refreshToken, 'base64').toString('ascii');
    return this.decodeUserID(jwt);
  }

  /**
   * Fetches the refreshToken from Redis (as a key),
   * and returns its value, which is the userID.
   * In Redis, [K, V] = [refreshToken, userID]
   *
   * @param refreshToken - JWT
   * @returns {Promise<number>} the userID belonging to the token
   * @throws {Error}
   */
  private async getRefreshTokenUserID(refreshToken: string): Promise<number> {
    const userID = await this.cacheManager.get<number>(refreshToken);

    if (!userID) {
      throw new Error('Could not find refresh token in Redis');
    }

    return userID;
  }

  private async saveRefreshToken(refreshToken: string, userID: number) {
    await this.cacheManager.set(refreshToken, userID, {
      ttl: 30 * 24 * 60 * 60, // 30 days
    });
  }

  private async deleteRefreshToken(refreshToken: string) {
    await this.cacheManager.del(refreshToken);
  }

  /**
   * Decodes a JWT and returns its 'sub' field (the user ID)
   * @param {string} token JWT
   * @returns {number} userID
   * @throws {Error}
   */
  private decodeUserID(token: string): number {
    const decoded = this.jwtService.decode(token);

    if (decoded && typeof decoded === 'object' && decoded.sub) {
      if (!Number.isInteger(decoded.sub)) {
        throw new Error('Could not decode userID from token');
      }
      return Number(decoded.sub);
    }

    throw new Error('Could not decode userID from token');
  }
}
