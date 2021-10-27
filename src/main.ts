import * as chalk from 'chalk';
import * as helmet from 'helmet';
import * as compression from 'compression';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { HttpConfig } from './config/interfaces/HttpConfig';

const getHttpConfig = (config: ConfigService): HttpConfig => {
  return config.get<HttpConfig>(HttpConfig.CONFIG_KEY, {
    infer: true,
  });
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService>(ConfigService);

  app.useGlobalPipes(new ValidationPipe());

  if ((process.env.NODE_ENV ?? 'dev') === 'prod') {
    app.use(helmet());
    app.use(compression());
  }

  const httpConfig = getHttpConfig(config);

  await app.listen(httpConfig.port, httpConfig.host, () => {
    const api = `http://${httpConfig.host}:${httpConfig.port}`;
    const graphQL = `${api}/graphql`;

    Logger.log(
      chalk`🚀 {white API is running on:} {bold {cyan ${api}}}`,
      'Main',
    );
    Logger.log(
      chalk`🪀 {white Apollo GraphQL Studio:} {bold {cyan ${graphQL}}}`,
      'Main',
    );
  });
}

bootstrap();
