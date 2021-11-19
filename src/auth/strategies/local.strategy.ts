import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../auth.service';
import { UserData } from 'src/user/dto/user-data.output';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  /**
   * This data will be attached to req.user by passport.
   *
   * See AuthResolver.login(), which uses the CurrentUser decorator,
   * which in turn uses ctx.getContext().req.user - that contains
   * the data returned from here.
   */
  public async validate(username: string, password: string): Promise<UserData> {
    const user = await this.authService.validateUser(username, password);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
