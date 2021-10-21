import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';
import { AuthConfig } from '../interfaces/AuthConfig';

@Injectable()
export class AuthConfigService implements JwtOptionsFactory {
  constructor(private configService: ConfigService) {}

  createJwtOptions(): JwtModuleOptions {
    const { jwtSecret: secret }: AuthConfig =
      this.configService.get<AuthConfig>(AuthConfig.CONFIG_KEY, {
        infer: true,
      });

    return {
      secret,
    };
  }
}
