import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

import { Role } from './enums/role.enum';
import { User } from '../users/user.entity';
import { TokenOutput } from './dto/token.output';
import { UsersService } from '../users/users.service';
import { UserData } from '../users/dto/userData.output';
import { UserRegisterInput } from './dto/user-register.input';

describe('AuthResolver', () => {
  let module: TestingModule;

  let authService: AuthService;
  let authResolver: AuthResolver;
  let usersService: UsersService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: UsersService,
          useValue: {},
        },
      ],
    }).compile();
    module.useLogger(false);

    authResolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
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

      authService.login = jest.fn(async () => tokens);

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
      authService.logout = jest.fn(async () => {
        throw new Error('refresh token not found');
      });

      expect(authResolver.logout(refreshToken)).rejects.toThrowError(
        UnauthorizedException,
      );

      expect(authService.logout).toHaveBeenCalledWith(refreshToken);
    });
  });

  describe('refreshToken', () => {
    it('should call the auth service to refresh the tokens', async () => {
      const tokens = {
        accessToken: 'new accessToken',
        refreshToken: 'new refreshToken',
      };

      authService.refreshTokens = jest.fn(async () => tokens);

      const res = await authResolver.refreshToken('old refreshToken');

      expect(res).toStrictEqual(TokenOutput.fromTokens(tokens));
      expect(authService.refreshTokens).toBeCalledWith('old refreshToken');
    });

    it('should throw 401 if tokens could not be refreshed', async () => {
      authService.refreshTokens = jest.fn(async () => {
        throw new Error('an error');
      });

      expect(
        authResolver.refreshToken('old refreshToken'),
      ).rejects.toThrowError(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should call the auth service to register a new user', async () => {
      const userRegisterInput = {
        email: 'email@test.com',
        firstName: 'first',
        lastName: 'last',
      } as UserRegisterInput;

      const user = {
        userId: 1,
        password: 'password',
        ...userRegisterInput,
      } as User;

      authService.register = jest.fn(async () => {
        return user;
      });

      const res = await authResolver.register(userRegisterInput);

      expect(res).toStrictEqual(user);
      expect(authService.register).toBeCalledWith(userRegisterInput);
    });

    it('should throw 400 if user could not be registered', async () => {
      const userRegisterInput = {
        email: 'email@test.com',
        firstName: 'first',
        lastName: 'last',
      } as UserRegisterInput;

      authService.register = jest.fn(async () => undefined);

      expect(authResolver.register(userRegisterInput)).rejects.toThrowError(
        BadRequestException,
      );
    });
  });

  describe('profile', () => {
    it('should call the users service to fetch details about the user', async () => {
      const user = {
        userId: 1,
        role: Role.User,
        firstName: 'first',
        lastName: 'last',
        password: 'password',
        email: 'email@test.com',
      } as User;

      usersService.findOneByID = jest.fn(async () => {
        return user;
      });

      const res = await authResolver.profile(user);

      expect(res).toStrictEqual(UserData.fromUser(user));
      expect(usersService.findOneByID).toBeCalledWith(user.userId);
    });

    it('should throw 401 if the user cannot be found', async () => {
      const user = {
        userId: 1,
        role: Role.User,
        firstName: 'first',
        lastName: 'last',
        password: 'password',
        email: 'email@test.com',
      } as User;

      usersService.findOneByID = jest.fn(async () => undefined);

      expect(authResolver.profile(user)).rejects.toThrowError(
        UnauthorizedException,
      );
    });
  });

  describe('userData', () => {
    it('should call the auth service to fetch details about the user', async () => {
      const tokens = {
        accesstoken: 'access token',
        refreshToken: 'refresh token',
      } as TokenOutput;

      const userData = {
        id: 1,
        role: Role.User,
        firstName: 'first',
        lastName: 'last',
        password: 'password',
        email: 'email@test.com',
      } as UserData;

      authService.fetchUserInfo = jest.fn(async () => userData);

      const res = await authResolver.userData(tokens);

      expect(res).toStrictEqual(userData);
      expect(authService.fetchUserInfo).toBeCalledWith(tokens);
    });

    it('should throw 401 if any error arises', async () => {
      const tokens = {
        accesstoken: 'access token',
        refreshToken: 'refresh token',
      } as TokenOutput;

      authService.fetchUserInfo = jest.fn(async () => {
        throw new Error('Could not decode userID from token');
      });

      expect(authResolver.userData(tokens)).rejects.toThrowError(
        UnauthorizedException,
      );
    });
  });

  describe('adminRoute', () => {
    it(`should return 'admin'`, async () => {
      const res = await authResolver.adminRoute();
      expect(res).toBe('admin');
    });
  });

  describe('userRoute', () => {
    it(`should return 'user'`, async () => {
      const res = await authResolver.userRoute();
      expect(res).toBe('user');
    });
  });

  describe('publicRoute', () => {
    it(`should return 'public'`, async () => {
      const res = await authResolver.publicRoute();
      expect(res).toBe('public');
    });
  });
});
