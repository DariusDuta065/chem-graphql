# NestJS GraphQL

[![codecov](https://codecov.io/gh/dduta065/chem-graphql/branch/master/graph/badge.svg?token=1V3OYGGg2J)](https://codecov.io/gh/dduta065/chem-graphql)

## Running the app

```bash
# install dependencies
yarn install

# start app
yarn start:dev
yarn start:production
```

## Testing

```bash
# unit tests
yarn test
# e2e tests
yarn test:e2e
# test coverage
yarn test:cov
```

## Quick start

```bash
# create schema
typeorm schema:drop
typeorm migration:run

# create admin user
yarn build
yarn cli:dev create:user -f Darius -l Duta -p password -e email@test.com -r admin
```
