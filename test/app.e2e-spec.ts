import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let moduleFixture;
  let app: INestApplication;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('ok');
  });

  it('/ping (GET)', () => {
    return request(app.getHttpServer()).get('/ping').expect(200).expect('pong');
  });
});
