# NestJS GraphQL

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
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
typeorm schema:drop
typeorm migration:run

export CLI_PATH=./dist/cli.js
yarn build
npx nestjs-command seed:db
```
