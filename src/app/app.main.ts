import * as chalk from 'chalk';
import * as helmet from 'helmet';
import * as compression from 'compression';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { INestApplication, Logger } from '@nestjs/common';

import setupLogger from './logger';
import { AppModule } from './app.module';
import { HttpConfig } from 'src/config/interfaces/HttpConfig';
import { TypeORMExceptionFilter } from 'src/shared/filters/typeorm-filter';

const configureApp = (app: INestApplication): void => {
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new TypeORMExceptionFilter());

  if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
    app.use(compression());
  }
};

const getHttpConfig = (config: ConfigService): HttpConfig => {
  return config.get<HttpConfig>(HttpConfig.CONFIG_KEY, {
    infer: true,
  });
};

const listenCallback = (port: number, host: string): void => {
  const api = `http://${host}:${port}`;
  const graphQL = `${api}/graphql`;

  Logger.log(chalk`🚀 {white API is running on:} {bold {cyan ${api}}}`, 'Main');
  Logger.log(
    chalk`🪀 {white Apollo GraphQL Studio:} {bold {cyan ${graphQL}}}`,
    'Main',
  );
};

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AppModule, {
    logger: setupLogger(),
  });

  // Setup pipes, middleware, etc..
  configureApp(app);

  const config: ConfigService = app.get<ConfigService>(ConfigService);
  const { port, host } = getHttpConfig(config);

  await app.listen(port, host, () => listenCallback(port, host));
}

export { configureApp, getHttpConfig, bootstrap };
