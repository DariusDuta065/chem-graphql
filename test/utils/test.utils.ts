import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { getConnection, getRepository } from 'typeorm';

@Injectable()
export class TestUtils {
  constructor() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error(`Use TestUtils only in the 'test' env`);
    }
  }

  static hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  static isJwt(jwt: string): boolean {
    const regxp = /(^[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$)/;

    return regxp.test(jwt);
  }

  getEntities(): EntityData[] {
    const connection = getConnection();

    if (!connection || !connection.isConnected) {
      throw new Error(`Could not establish typeorm connection`);
    }

    const entities: EntityData[] = [];

    connection.entityMetadatas.forEach((e) => {
      entities.push({
        name: e.name,
        tableName: e.tableName,
      });
    });

    return entities;
  }

  async cleanAll(entities?: EntityData[]) {
    try {
      if (!entities) {
        entities = this.getEntities();
      }
      for (const entity of entities) {
        const repository = getRepository(entity.name);
        await repository.query(`DELETE FROM ${entity.tableName}`);
      }
    } catch (error) {
      throw new Error(`Error cleaning test DB ${error}`);
    }
  }

  async load<T>(entities: T[] | T, entityName: string) {
    try {
      const repo = this.getRepository(entityName);

      await repo
        .createQueryBuilder(entityName)
        .insert()
        .values(entities)
        .execute();
    } catch (error) {
      throw new Error(`Could not load all entities: ${error}`);
    }
  }

  private getRepository(entityName: string) {
    try {
      return getRepository(entityName.toLowerCase());
    } catch (error) {
      throw new Error(`Could not get repository of ${entityName}`);
    }
  }
}

class EntityData {
  name: string;
  tableName: string;
}
