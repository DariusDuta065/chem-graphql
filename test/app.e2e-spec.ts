import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { AppModule } from 'src/app/app.module';
import { NotionAPIProcessor } from 'src/notion/processors';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(NotionAPIProcessor)
      .useValue({})
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('ok');
  });

  it('/ping (GET)', () => {
    return request(app.getHttpServer()).get('/ping').expect(200).expect('pong');
  });

  afterAll(async () => {
    await app.close();
  });
});
