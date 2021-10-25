import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('AppController', () => {
    it('index should return "ok"', () => {
      expect(appController.index()).toBe('ok');
    });
  });
});
