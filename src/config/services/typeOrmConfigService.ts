import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConnectionOptions } from 'typeorm';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

import { TypeOrmConfig } from '../interfaces/TypeOrmConfig';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    const envConfig: TypeOrmConfig = this.configService.get<TypeOrmConfig>(
      TypeOrmConfig.CONFIG_KEY,
      { infer: true },
    );

    return Object.assign({}, await getConnectionOptions(), envConfig);
  }
}
