import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';
import { JwtConfig } from '../interfaces/JwtConfig';

@Injectable()
export class JwtConfigService implements JwtOptionsFactory {
  constructor(private configService: ConfigService) {}

  createJwtOptions(): JwtModuleOptions {
    const config: JwtConfig = this.configService.get<JwtConfig>(
      JwtConfig.CONFIG_KEY,
      {
        infer: true,
      },
    );

    return config;
  }
}
