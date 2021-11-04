import { Injectable } from '@nestjs/common';
import { getConnectionOptions } from 'typeorm';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    return getConnectionOptions();
  }
}
