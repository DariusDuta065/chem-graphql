import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserData } from '../../users/dto/userData.output';
import { jwtConstants } from '../constants';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
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
