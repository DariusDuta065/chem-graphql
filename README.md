# NestJS GraphQL

## Running the app

```bash
# install dependencies
yarn install

# start app
yarn start
yarn start:dev
yarn start:production
```

## Test

```bash
# unit tests
yarn test
# e2e tests
yarn test:e2e
# test coverage
yarn test:cov
```

## CLI commands

```bash

# run migrations
typeorm migration:run

# run seed command
CLI_PATH=./dist/cli.js npx nestjs-command seed:db
#  or
export CLI_PATH=./dist/cli.js 
yarn build && npx nestjs-command seed:pets -n 5
```

## Quick start

```bash
# create schema
typeorm schema:drop
typeorm migration:run

# seed database
export CLI_PATH=./dist/cli.js
yarn build
npx nestjs-command seed:db
```

## ToDos

- GraphQL auth
- Environment configuration
- Queues
- Events
- Deployment to productionuction
- Add explicit `public` access modifiers
