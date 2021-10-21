import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthConfigService } from '../../config/services/authConfigService';
import { UserData } from '../../users/dto/userData.output';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authConfig: AuthConfigService) {
    super({
      ignoreExpiration: false,
      secretOrKey: authConfig.createJwtOptions().secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  /**
   * This data will be attached to req.user by passport.
   *
   * @param {UserData & TokenData} payload
   * @returns {object} data attached to req.user
   */
  async validate(payload: UserData & TokenData) {
    const { iat, exp, ...rest } = payload;

    return { userId: payload.sub, username: payload.email, ...rest };
  }
}

class TokenData {
  sub: number;
  iat: number;
  exp: number;
}
