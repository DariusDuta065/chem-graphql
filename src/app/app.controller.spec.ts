import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('AppController', () => {
    describe('index', () => {
      it(`should return 'ok'`, () => {
        expect(appController.index()).toBe('ok');
      });
    });

    describe('ping', () => {
      it(`should return 'pong'`, () => {
        expect(appController.ping()).toBe('pong');
      });
    });
  });
});
