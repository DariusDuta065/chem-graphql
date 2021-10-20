import * as chalk from 'chalk';
import * as helmet from 'helmet';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
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
  }

  const httpConfig = getHttpConfig(config);

  await app.listen(httpConfig.port, httpConfig.host, () => {
    const link = `http://${httpConfig.host}:${httpConfig.port}`;

    Logger.log(
      chalk`🚀 {white API is running on:} {bold {cyan ${link}}}`,
      'Main',
    );
    Logger.log(
      chalk`🚀 {white GraphQL playground:} {bold {cyan ${link + '/graphql'}}}`,
      'Main',
    );
  });
}

bootstrap();
