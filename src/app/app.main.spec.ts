import * as helmet from 'helmet';
import * as compression from 'compression';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { INestApplication, Logger } from '@nestjs/common';

import { HttpConfig } from '../config/interfaces/HttpConfig';
import { configureApp, getHttpConfig, bootstrap } from './app.main';

describe('app.main.ts', () => {
  describe('getHttpConfig', () => {
    it('should fetch HttpConfig from config service', () => {
      jest.mock('@nestjs/config');
      const configService = new ConfigService();

      configService.get = jest.fn(() => {
        return {
          host: '127.0.0.1',
          port: 3000,
        } as HttpConfig;
      });

      const res = getHttpConfig(configService);

      expect(res).toStrictEqual({
        host: '127.0.0.1',
        port: 3000,
      });
      expect(configService.get).toBeCalledWith(HttpConfig.CONFIG_KEY, {
        infer: true,
      });
    });
  });

  describe('bootstrap', () => {
    it('should start listening for requests', async () => {
      Logger.log = jest.fn();

      const httpConfig = {
        host: '127.0.0.1',
        port: 3000,
      } as HttpConfig;

      const useGlobalPipes = jest.fn();
      const useGlobalFilters = jest.fn();
      const use = jest.fn();
      const listen = jest.fn((p, h, cb) => {
        cb();
      });
      const get = jest.fn().mockReturnValue({
        get() {
          return httpConfig;
        },
      });

      NestFactory.create = jest.fn(async () => {
        return {
          useGlobalPipes,
          useGlobalFilters,
          use,
          listen,
          get,
        };
      });

      await bootstrap();

      expect(NestFactory.create).toBeCalled();
      expect(get).toBeCalledTimes(1);
      expect(listen).toBeCalledTimes(1);
      expect(listen).toBeCalledWith(
        httpConfig.port,
        httpConfig.host,
        expect.any(Function),
      );
    });
  });

  describe('configureApp', () => {
    it('should set up the validation pipe', () => {
      const app = {} as INestApplication;
      app.useGlobalPipes = jest.fn();
      app.useGlobalFilters = jest.fn();
      app.use = jest.fn();

      configureApp(app);

      expect(app.useGlobalPipes).toBeCalledTimes(1);
    });

    it('should not use helmet & compression in dev', () => {
      const app = {} as INestApplication;
      app.useGlobalPipes = jest.fn();
      app.useGlobalFilters = jest.fn();
      app.use = jest.fn();

      process.env.NODE_ENV = 'dev';
      configureApp(app);

      expect(app.use).toBeCalledTimes(0);
    });

    it('should use helmet & compression in production', () => {
      const app = {} as INestApplication;
      app.useGlobalPipes = jest.fn(() => app);
      app.useGlobalFilters = jest.fn();
      app.use = jest.fn(() => app);

      process.env.NODE_ENV = 'production';
      configureApp(app);

      const {
        mock: { calls },
      } = app.use as jest.MockedFunction<typeof app.use>;

      expect(calls[0][0].toString()).toBe(helmet().toString());
      expect(calls[1][0].toString()).toBe(compression().toString());

      expect(app.use).toBeCalledTimes(2);
    });
  });
});
