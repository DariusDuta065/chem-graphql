require('leaked-handles');

import * as request from 'supertest';

import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { TestUtils } from './utils/test.utils';
import { AuthUtils } from './utils/auth.utils';

import { User } from '../src/users/user.entity';
import { AppModule } from '../src/app/app.module';
import { Role } from '../src/auth/enums/role.enum';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { TokenOutput } from '../src/auth/dto/token.output';

import mutations from './graphql/mutations';

describe('AuthResolver (e2e)', () => {
  let app: INestApplication;

  let testUtils: TestUtils;
  let authUtils: AuthUtils;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule, UsersModule, AuthModule],
      providers: [TestUtils, AuthUtils],
    }).compile();

    testUtils = module.get<TestUtils>(TestUtils);
    authUtils = module.get<AuthUtils>(AuthUtils);

    app = module.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await testUtils.cleanAll();
  });

  describe('login', () => {
    it(`returns unauthorized if user credentials don't match`, async () => {
      await testUtils.load(
        {
          email: 'test1@email.com',
          firstName: 'first name 1',
          lastName: 'last name 1',
          password: TestUtils.hashPassword('password'),
          role: Role.User,
        },
        User.name,
      );

      const loginData = {
        username: 'test1@email.com',
        password: 'wrong password',
      };

      const res = await request(app.getHttpServer()).post('/graphql').send({
        operationName: 'LoginMutation',
        query: mutations.login,
        variables: loginData,
      });

      expect(res.body.data).toBeNull();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toBe('Unauthorized');
    });

    it(`issues access & refresh tokens upon successful authentication`, async () => {
      await testUtils.load(
        {
          email: 'test1@email.com',
          firstName: 'first name 1',
          lastName: 'last name 1',
          password: TestUtils.hashPassword('password 1'),
          role: Role.User,
        },
        User.name,
      );

      const loginData = {
        username: 'test1@email.com',
        password: 'password 1',
      };

      const res = await request(app.getHttpServer()).post('/graphql').send({
        operationName: 'LoginMutation',
        query: mutations.login,
        variables: loginData,
      });

      expect(res.body.data).toBeDefined();
      expect(res.body.errors).toBeUndefined();

      const tokens: TokenOutput = res.body.data.login;
      expect(typeof tokens.accesstoken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
      expect(TestUtils.isJwt(tokens.accesstoken)).toBeTruthy();
    });
  });
});
