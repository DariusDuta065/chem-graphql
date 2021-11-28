const yaml = require('js-yaml');
const { join } = require('path');
const { readFileSync } = require('fs');
const { SnakeNamingStrategy } = require('typeorm-naming-strategies');

const config = yaml.load(readFileSync(join(__dirname, 'env.yaml'), 'utf8'));

let typeormConfig = {
  ...config.db.typeorm,

  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/**/migrations/*{.ts,.js}'],
  subscribers: ['dist/**/subscribers/*{.ts,.js}'],
  cli: {
    entitiesDir: 'src/**/*.entity{.ts,.js}',
    migrationsDir: 'src/**/migrations',
    subscribersDir: 'src/**/subscribers',
  },
};

// fix for issues with jest 'test' environment
if (process.env.NODE_ENV === 'test') {
  typeormConfig = {
    ...typeormConfig,

    database: 'graphql-test',
    synchronize: true,
    entities: ['src/**/*.entity{.ts,.js}'],
    migrations: ['src/**/migrations/*{.ts,.js}'],
    subscribers: ['src/**/subscribers/*{.ts,.js}'],
  };
}

module.exports = {
  ...typeormConfig,
  namingStrategy: new SnakeNamingStrategy(),
};
