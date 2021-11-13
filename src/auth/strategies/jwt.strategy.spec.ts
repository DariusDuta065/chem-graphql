import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { JwtStrategy, TokenData } from './jwt.strategy';
import { UserData } from '../../user/dto/user-data.output';
import { JwtConfigService } from '../../config/services/jwtConfigService';

jest.mock('@nestjs/config');
jest.mock('../../config/services/jwtConfigService');

describe('JwtStrategy', () => {
  let authConfig: JwtConfigService;

  beforeAll(() => {
    const configService = new ConfigService();
    authConfig = new JwtConfigService(configService);

    authConfig.createJwtOptions = jest.fn(() => {
      return {
        secret: 'secretKey',
      };
    });
  });

  it('should be defined', () => {
    const jwtStrategy = new JwtStrategy(authConfig);

    expect(jwtStrategy).toBeDefined();
    expect(jwtStrategy).toBeInstanceOf(Strategy);
  });

  describe('validate', () => {
    it('should attach userId to req.user', async () => {
      const payload = {
        sub: 1,
        iat: Math.round(Date.now() / 1000),
        exp: Math.round(Date.now() / 1000),

        id: 1,
        email: 'test@test.com',
        firstName: 'first',
        lastName: 'last',
        role: 'user',
      } as UserData & TokenData;
      const jwtStrategy = new JwtStrategy(authConfig);

      const { userId, ...rest } = await jwtStrategy.validate(payload);

      expect(userId).toBe(1);
      expect(rest).toStrictEqual({
        id: 1,
        sub: 1,
        email: 'test@test.com',
        firstName: 'first',
        lastName: 'last',
        role: 'user',
      });
    });
  });
});
