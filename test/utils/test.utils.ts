import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { getConnection, getRepository, Repository } from 'typeorm';

import { User } from 'src/user/user.entity';
import { Group } from 'src/group/group.entity';
import { Content } from 'src/content/content.entity';

@Injectable()
export class TestUtils {
  constructor() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error(`Use TestUtils only in the 'test' env`);
    }
  }

  public static hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  public static isJwt(jwt: string): boolean {
    const regxp = /(^[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$)/;

    return regxp.test(jwt);
  }

  public getEntities(): EntityData[] {
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

  public async cleanAll(entities?: EntityData[]): Promise<void> {
    try {
      if (!entities) {
        entities = this.getEntities();
      }
      for (const entity of entities) {
        const repository = getRepository(entity.name);
        await repository.query(`DELETE FROM \`${entity.tableName}\``);
      }
    } catch (error) {
      throw new Error(`Error cleaning test DB ${error}`);
    }
  }

  public async load<T>(entities: T[] | T, entityName: string): Promise<void> {
    try {
      const repo = this.getRepository(entityName);

      await repo
        .createQueryBuilder(entityName)
        .insert()
        .values(entities as any)
        .execute();
    } catch (error) {
      throw new Error(`Could not load all entities: ${error}`);
    }
  }

  private getRepository(entityName: string): Repository<any> {
    try {
      return getRepository(entityName.toLowerCase());
    } catch (error) {
      throw new Error(`Could not get repository of ${entityName}`);
    }
  }

  public async getAll<T>(entityName: string): Promise<T[]> {
    try {
      const repo = this.getRepository(entityName);

      return await repo.find();
    } catch (error) {
      throw new Error(`Could not get all entities: ${error}`);
    }
  }

  public async updateGroup(
    groupID: number,
    users: User[] = [],
    contents: Content[] = [],
  ): Promise<Group> {
    const repo: Repository<Group> = this.getRepository(Group.name);

    const group = await repo.findOneOrFail(groupID);

    if (users.length > 0) {
      group.users = Promise.resolve(users);
    }
    if (contents.length > 0) {
      group.contents = Promise.resolve(contents);
    }

    return await repo.save(group);
  }
}

class EntityData {
  public name: string;
  public tableName: string;
}
