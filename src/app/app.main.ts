import * as chalk from 'chalk';
import * as helmet from 'helmet';
import * as compression from 'compression';

import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { HttpConfig } from '../config/interfaces/HttpConfig';

const configureApp = (app: INestApplication) => {
  app.useGlobalPipes(new ValidationPipe());

  if (process.env.NODE_ENV === 'prod') {
    app.use(helmet());
    app.use(compression());
  }
};

const getHttpConfig = (config: ConfigService): HttpConfig => {
  return config.get<HttpConfig>(HttpConfig.CONFIG_KEY, {
    infer: true,
  });
};

const listenCallback = (port: number, host: string) => {
  const api = `http://${host}:${port}`;
  const graphQL = `${api}/graphql`;

  Logger.log(chalk`🚀 {white API is running on:} {bold {cyan ${api}}}`, 'Main');
  Logger.log(
    chalk`🪀 {white Apollo GraphQL Studio:} {bold {cyan ${graphQL}}}`,
    'Main',
  );
};

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);

  // Setup pipes, middleware, etc..
  configureApp(app);

  const config: ConfigService = app.get<ConfigService>(ConfigService);
  const { port, host } = getHttpConfig(config);

  await app.listen(port, host, () => listenCallback(port, host));
}

export { configureApp, getHttpConfig, bootstrap };
