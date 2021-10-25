import { Cache } from 'cache-manager';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { CacheModule, CACHE_MANAGER } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { Role } from './enums/role.enum';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { UserData } from '../users/dto/userData.output';

import configuration from '../config/configuration';
import { JwtConfigService } from '../config/services/jwtConfigService';
import { CacheConfigService } from '../config/services/cacheConfigService';
import { TypeOrmConfigService } from '../config/services/typeOrmConfigService';

const authModule = {
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      useClass: CacheConfigService,
    }),

    PassportModule,
    UsersModule,

    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),

    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthService, AuthResolver],
};

describe('AuthService', () => {
  let module: TestingModule;
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let cacheManager: Cache;

  beforeAll(async () => {
    module = await Test.createTestingModule(authModule).compile();
    module.useLogger(false);

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    cacheManager = await module.resolve<Cache>(CACHE_MANAGER);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    it('should generate pair of tokens', async () => {
      cacheManager.set = jest.fn(async (key: string, value: string) => {
        return;
      });
      jwtService.sign = jest
        .fn()
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');

      const userData = new UserData({
        id: 1,
        firstName: 'first name',
        lastName: 'last name',
        email: 'email@email.com',
        role: Role.User,
      });

      const res = await authService.login(userData);

      expect(jwtService.sign).toBeCalledTimes(2);
      expect(jwtService.sign).toBeCalledWith(
        { ...userData, sub: userData.id },
        { expiresIn: '15m' },
      );
      expect(jwtService.sign).toBeCalledWith(
        { sub: userData.id },
        { expiresIn: '30d' },
      );

      expect(res.accessToken).toBe('accessToken');
      expect(res.refreshToken).toBe(
        Buffer.from('refreshToken').toString('base64'),
      );
    });

    it('should save refresh token into cache', async () => {
      cacheManager.set = jest.fn(async (key: string, value: string) => {
        return;
      });
      jwtService.sign = jest
        .fn()
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');

      const userData = new UserData({
        id: 1,
        firstName: 'first name',
        lastName: 'last name',
        email: 'email@email.com',
        role: Role.User,
      });

      await authService.login(userData);

      expect(cacheManager.set).toBeCalled();
      expect(cacheManager.set).toBeCalledWith(
        Buffer.from('refreshToken').toString('base64'),
        userData.id,
        { ttl: 30 * 24 * 60 * 60 }, // 30 days
      );
    });
  });

  describe('logout', () => {
    it('should delete refreshToken from cache', async () => {
      const refreshToken = 'refreshToken';
      const userID = 1;

      cacheManager.del = jest.fn(async (key: string) => {
        return;
      });
      cacheManager.get = jest.fn(async (key: string) => {
        return userID;
      });

      await authService.logout(refreshToken);

      expect(cacheManager.get).toBeCalledWith(refreshToken);
      expect(cacheManager.del).toBeCalledWith(refreshToken);
    });

    it('should throw an error if token is not found in cache', async () => {
      const refreshToken = 'refreshToken';

      cacheManager.del = jest.fn(async (key: string) => {
        return;
      });
      cacheManager.get = jest.fn(async (key: string) => {
        return undefined;
      });

      await expect(authService.logout(refreshToken)).rejects.toThrowError();

      expect(cacheManager.get).toBeCalledWith(refreshToken);
      expect(cacheManager.del).not.toBeCalled();
    });
  });

  describe('refreshTokens', () => {
    it('should ...', async () => {
      const userData = new UserData({
        id: 1,
        firstName: 'first',
        lastName: 'last',
        email: 'email@email.com',
        role: Role.User,
      });

      usersService.findOneByID = jest
        .fn()
        .mockReturnValueOnce({ userId: userData.id, ...userData });

      jwtService.decode = jest.fn().mockReturnValueOnce({ sub: userData.id });
      cacheManager.get = jest.fn().mockReturnValueOnce(userData.id);

      authService.login = jest.fn().mockReturnValueOnce({
        accessToken: 'new accessToken',
        refreshToken: 'new refreshToken',
      });

      const res = await authService.refreshTokens('old refreshToken');

      expect(usersService.findOneByID).toBeCalledWith(userData.id);
      expect(authService.login).toBeCalledWith(userData);

      expect(res.accessToken).toBe('new accessToken');
      expect(res.refreshToken).toBe('new refreshToken');
    });
  });
});
