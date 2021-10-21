import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtConfigService } from '../../config/services/jwtConfigService';
import { UserData } from '../../users/dto/userData.output';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authConfig: JwtConfigService) {
    super({
      ignoreExpiration: false,
      secretOrKey: authConfig.createJwtOptions().secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  /**
   * This data will be attached to req.user by passport.
   *
   * See AuthResolver.profile(), which uses the CurrentUser decorator,
   * which in turn uses ctx.getContext().req.user - that contains
   * the data returned from here.
   */
  async validate(payload: UserData & TokenData) {
    const { iat, exp, ...rest } = payload;

    return { userId: payload.sub, ...rest };
  }
}

class TokenData {
  sub: number;
  iat: number;
  exp: number;
}
