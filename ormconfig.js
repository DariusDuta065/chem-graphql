require('dotenv').config({ path: `env/${process.env.NODE_ENV}.env` });
const { SnakeNamingStrategy } = require('typeorm-naming-strategies');

const entitiesDir = process.env.NODE_ENV === 'test' ? 'src' : 'dist';

module.exports = {
  type: process.env.TYPEORM_TYPE,
  database: process.env.TYPEORM_DATABASE,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  synchronize: process.env.TYPEORM_SYNCHRONIZE,

  namingStrategy: new SnakeNamingStrategy(),

  entities: [`${entitiesDir}/**/*.entity{.ts,.js}`],
  migrations: [`${entitiesDir}/db/migrations/*{.ts,.js}`],
  subscribers: [`${entitiesDir}/db/subscribers/*{.ts,.js}`],

  cli: {
    entitiesDir: 'src/**/*.entity{.ts,.js}',
    migrationsDir: 'src/db/migrations',
    subscribersDir: 'src/db/subscribers',
  },
};
