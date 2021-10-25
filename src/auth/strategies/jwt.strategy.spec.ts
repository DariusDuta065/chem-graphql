import { ConfigService } from '@nestjs/config';

import { JwtStrategy } from './jwt.strategy';
import { JwtConfigService } from '../../config/services/jwtConfigService';
import { Strategy } from 'passport-jwt';

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
});
