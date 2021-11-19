import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserData } from 'src/user/dto/user-data.output';
import { JwtConfigService } from 'src/config/services/jwtConfigService';

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
  public validate(payload: UserData & TokenData): any {
    const res = Object.assign({ userId: payload.sub }, payload);
    delete res.exp;
    delete res.iat;
    return res;
  }
}

export class TokenData {
  public sub: number;
  public iat?: number;
  public exp?: number;
}
