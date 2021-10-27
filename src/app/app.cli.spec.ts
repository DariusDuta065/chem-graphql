import { NestFactory } from '@nestjs/core';
import { CommandModule } from 'nestjs-command/dist/command.module.js';
import { CommandService } from 'nestjs-command/dist/command.service.js';

import { bootstrap } from './app.cli';
import { AppModule } from './app.module';

describe('app.cli', () => {
  describe('bootstrap', () => {
    it('should create an app ctx via AppModule', async () => {
      NestFactory.createApplicationContext = jest.fn(async () => {
        return {
          select: jest.fn().mockReturnValue({
            get: jest.fn().mockReturnValue({ exec: jest.fn() }),
          }),
          close: jest.fn(),
        } as any;
      });

      await bootstrap();

      expect(NestFactory.createApplicationContext).toBeCalledWith(AppModule);
    });

    it('should attempt to execute the given command', async () => {
      const exec = jest.fn();
      const get = jest.fn().mockReturnValue({ exec });
      const select = jest.fn().mockReturnValue({ get });

      const close = jest.fn();
      const mockExit = jest.spyOn(process, 'exit').mockImplementation();

      NestFactory.createApplicationContext = jest.fn(async () => {
        return {
          select,
          close,
        } as any;
      });

      await bootstrap();

      expect(select).toBeCalledWith(CommandModule);
      expect(get).toBeCalledWith(CommandService);
      expect(exec).toBeCalled();

      expect(close).toBeCalled();
      expect(mockExit).not.toBeCalled();
    });

    it('should exit process if any error arises', async () => {
      const select = jest.fn(() => {
        throw new Error('error');
      });

      const close = jest.fn();

      const mockConsole = jest.spyOn(console, 'error').mockImplementation();
      const mockExit = jest.spyOn(process, 'exit').mockImplementation();

      NestFactory.createApplicationContext = jest.fn(async () => {
        return {
          select,
          close,
        } as any;
      });

      await bootstrap();

      expect(close).toBeCalled();
      expect(mockConsole).toBeCalled();
      expect(mockExit).toBeCalled();
    });
  });
});
