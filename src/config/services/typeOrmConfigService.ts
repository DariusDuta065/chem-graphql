import { Injectable } from '@nestjs/common';
import { getConnectionOptions } from 'typeorm';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    if (!process.env.NODE_ENV) {
      throw new Error('NODE_ENV is not defined');
    }

    if (!['test', 'dev', 'production'].includes(process.env.NODE_ENV)) {
      throw new Error('NODE_ENV value is not accepted');
    }

    const config = Object.assign({}, await getConnectionOptions(), {
      type: process.env.TYPEORM_TYPE,
      database: process.env.TYPEORM_DATABASE,
      username: process.env.TYPEORM_USERNAME,
      password: process.env.TYPEORM_PASSWORD,
      synchronize: process.env.TYPEORM_SYNCHRONIZE,
    });

    return config;
  }
}
