import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';

import { Strategy } from 'passport-local';

import { AuthService } from '../auth.service';
import { LocalStrategy } from './local.strategy';

import { Role } from '../enums/role.enum';
import { UserData } from 'src/users/dto/userData.output';

describe('LocalStrategy', () => {
  let module: TestingModule;
  let authService: AuthService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthService,
          useValue: () => ({}),
        },
      ],
    }).compile();
    module.useLogger(false);

    authService = module.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    const jwtStrategy = new LocalStrategy(authService);

    expect(jwtStrategy).toBeDefined();
    expect(jwtStrategy).toBeInstanceOf(Strategy);
  });

  describe('validate', () => {
    it('should call authService to validate user', async () => {
      const userData = {
        id: 1,
        firstName: 'first',
        lastName: 'last',
        email: 'email@email.com',
        role: Role.User,
      } as UserData;
      authService.validateUser = jest.fn(async () => userData);

      const jwtStrategy = new LocalStrategy(authService);

      await jwtStrategy.validate('username', 'password');

      expect(authService.validateUser).toBeCalledWith('username', 'password');
    });

    it('should return the user if username & password match', async () => {
      const userData = {
        id: 1,
        firstName: 'first',
        lastName: 'last',
        email: 'email@email.com',
        role: Role.User,
      } as UserData;
      authService.validateUser = jest.fn(async () => userData);

      const jwtStrategy = new LocalStrategy(authService);

      const res = await jwtStrategy.validate('username', 'password');

      expect(res).toBe(userData);
    });

    it('should throw an error if no user matches input', async () => {
      authService.validateUser = jest.fn(async () => null);

      const jwtStrategy = new LocalStrategy(authService);

      expect(jwtStrategy.validate('username', 'password')).rejects.toThrowError(
        UnauthorizedException,
      );
    });
  });
});
