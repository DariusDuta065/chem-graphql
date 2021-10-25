export class TypeOrmConfig {
  static CONFIG_KEY = 'db.typeorm';

  type: string;
  database: string;
  username: string;
  password: string;
  keepConnectionAlive: boolean;

  entities: string[];
  migrations: string[];
  subscribers: string[];

  cli: {
    entitiesDir: string;
    migrationsDir: string;
    subscribersDir: string;
  };
}
