const { SnakeNamingStrategy } = require('typeorm-naming-strategies');

const loadConfiguration = require('./dist/config/configuration.js').default;

// const config = yaml.load(readFileSync(join(__dirname, 'env.yaml'), 'utf8'));
const config = loadConfiguration();

let typeormConfig = {
  ...config.db.typeorm,

  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/**/migrations/*{.ts,.js}'],
  subscribers: ['dist/**/subscribers/*{.ts,.js}'],
  // cli: {
  //   entitiesDir: 'src/**/*.entity{.ts,.js}',
  //   migrationsDir: 'src/**/migrations',
  //   subscribersDir: 'src/**/subscribers',
  // },
};

// fix for issues with jest 'test' environment
if (process.env.NODE_ENV === 'test') {
  typeormConfig = {
    ...typeormConfig,

    database: 'graphql-test',
    synchronize: true,

    // >> comment out these lines for typeorm
    entities: ['src/**/*.entity{.ts,.js}'],
    migrations: ['src/**/migrations/*{.ts,.js}'],
    subscribers: ['src/**/subscribers/*{.ts,.js}'],
    // <<
  };
}

module.exports = {
  ...typeormConfig,
  namingStrategy: new SnakeNamingStrategy(),
};
