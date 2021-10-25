import { Test, TestingModule } from '@nestjs/testing';

import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from '../config/configuration';

import { CacheModule, UnauthorizedException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { TypeOrmConfigService } from '../config/services/typeOrmConfigService';
import { AuthResolver } from './auth.resolver';
import { UsersModule } from '../users/users.module';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { CacheConfigService } from '../config/services/cacheConfigService';
import { JwtConfigService } from '../config/services/jwtConfigService';
import { UserData } from '../users/dto/userData.output';
import { Role } from './enums/role.enum';

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

describe('AuthResolver', () => {
  let authResolver: AuthResolver;
  let authService: AuthService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule(authModule).compile();
    module.useLogger(false);

    authResolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(authResolver).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login()', async () => {
      const tokens = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      authService.login = jest.fn(async (userData: UserData) => tokens);

      const userData = new UserData({
        id: 1,
        firstName: 'first name',
        lastName: 'last name',
        email: 'email@email.com',
        role: Role.User,
      });

      const res = await authResolver.login(
        'email@email.com',
        'password',
        userData,
      );

      expect(res.accesstoken).toEqual(tokens.accessToken);
      expect(res.refreshToken).toEqual(tokens.refreshToken);
      expect(authService.login).toBeCalledWith(userData);
    });

    it('should throw 401 if authService throws an error', async () => {
      authService.login = jest
        .fn()
        .mockRejectedValue(new Error('User not found'));

      const userData = new UserData({
        id: 1,
        firstName: 'first name',
        lastName: 'last name',
        email: 'email@email.com',
        role: Role.User,
      });

      await expect(
        authResolver.login('email@email.com', 'password', userData),
      ).rejects.toThrowError(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should call authService.logout()', async () => {
      const refreshToken = 'refreshTokenss';
      authService.logout = jest.fn();

      await authResolver.logout(refreshToken);

      expect(authService.logout).toHaveBeenCalledWith(refreshToken);
    });

    it('should throw 401 if authService throws an error', async () => {
      const refreshToken = 'refreshToken';
      authService.logout = jest
        .fn()
        .mockRejectedValue(new Error('refresh token not found'));

      await expect(authResolver.logout(refreshToken)).rejects.toThrowError(
        UnauthorizedException,
      );

      expect(authService.logout).toHaveBeenCalledWith(refreshToken);
    });
  });

  describe('refreshToken', () => {
    it('should call authService.refreshToken()', async () => {
      expect(1).toBe(1); // TODO
    });
  });
});
