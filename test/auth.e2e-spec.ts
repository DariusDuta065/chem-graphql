import * as request from 'supertest';

import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { TestUtils } from './utils/test.utils';
import { AuthUtils } from './utils/auth.utils';

import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { GroupModule } from 'src/group/group.module';

import { User } from 'src/user/user.entity';
import { AppModule } from 'src/app/app.module';
import { configureApp } from 'src/app/app.main';
import { Role } from 'src/auth/enums/role.enum';
import { TokenOutput } from 'src/auth/dto/token.output';
import { UserData } from 'src/user/dto/user-data.output';
import { NotionAPIProcessor } from 'src/notion/processors';

import queries from './graphql/queries';
import mutations from './graphql/mutations';

describe('AuthResolver (e2e)', () => {
  let app: INestApplication;

  let testUtils: TestUtils;
  let authUtils: AuthUtils;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule, UserModule, AuthModule, GroupModule],
      providers: [TestUtils, AuthUtils],
    })
      .overrideProvider(NotionAPIProcessor)
      .useValue({})
      .compile();

    testUtils = module.get<TestUtils>(TestUtils);
    authUtils = module.get<AuthUtils>(AuthUtils);

    app = module.createNestApplication();
    app.useLogger(false);
    configureApp(app);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await testUtils.cleanAll();
  });

  afterEach(async () => {
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

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          ...mutations.auth.login,
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

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          ...mutations.auth.login,
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

  describe('logout', () => {
    it(`logouts auth'ed user`, async () => {
      const { refreshToken } = await authUtils.getTokens();

      const logoutData = {
        logoutRefreshToken: refreshToken,
      };

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          ...mutations.auth.logout,
          variables: logoutData,
        });

      expect(res.body.data).toBeDefined();
      expect(res.body.data.logout).toBe('ok');
    });

    it(`returns unauthorized if session token is invalid`, async () => {
      const logoutData = {
        logoutRefreshToken: 'refreshToken',
      };

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          ...mutations.auth.logout,
          variables: logoutData,
        });

      expect(res.body.data).toBeNull();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toBe('Unauthorized');
    });
  });

  describe('refreshToken', () => {
    it(`returns a new pair of tokens for auth'ed user`, async () => {
      const { refreshToken, user } = await authUtils.getTokens();

      const refreshData = {
        refreshToken,
      };

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          ...mutations.auth.refreshToken,
          variables: refreshData,
        });

      const tokenOutput: TokenOutput = res.body.data.refreshToken;

      expect(TestUtils.isJwt(tokenOutput.accesstoken)).toBeTruthy();
      expect(tokenOutput.refreshToken).toEqual(expect.any(String));
      expect(tokenOutput.userData).toStrictEqual({
        id: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      } as UserData);
    });
  });

  describe('register', () => {
    it(`allows admins to create new users & returns their cleartext password`, async () => {
      const { accessToken } = await authUtils.getTokens({
        role: Role.Admin,
      });

      const userRegisterInput = {
        email: 'testemail@test.com',
        firstName: 'first name',
        lastName: 'last name',
      };

      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...mutations.auth.register,
          variables: {
            userRegisterInput,
          },
        });

      const { password, userId, ...rest } = body.data.register;
      expect(password).toEqual(expect.any(String));
      expect(userId).toEqual(expect.any(Number));

      expect(rest).toStrictEqual({
        email: userRegisterInput.email,
        firstName: userRegisterInput.firstName,
        lastName: userRegisterInput.lastName,
        role: 'User',
      });
    });

    it(`blocks regular users from registering users`, async () => {
      const { accessToken } = await authUtils.getTokens({
        role: Role.User,
      });

      const userRegisterInput = {
        email: 'testemail@test.com',
        firstName: 'first name',
        lastName: 'last name',
      };

      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...mutations.auth.register,
          variables: {
            userRegisterInput,
          },
        });

      expect(body.data).toBeNull();
      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toBe('Unauthorized');
    });
  });

  describe('resetPassword', () => {
    it(`allows admins to reset user's password & returns the new cleartext password`, async () => {
      const { accessToken, user } = await authUtils.getTokens({
        role: Role.Admin,
      });
      const oldPassword = user.password;

      const variables = {
        userID: user.userId,
      };

      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...mutations.auth.resetPassword,
          variables,
        });

      const { password: newPassword } = body.data.resetPassword;
      expect(newPassword).toEqual(expect.any(String));
      expect(newPassword).not.toEqual(oldPassword);
    });
  });

  describe('profile', () => {
    it(`returns user data of auth'ed user`, async () => {
      const { accessToken, user } = await authUtils.getTokens();

      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...queries.auth.profile,
        });

      expect(body.data.profile).toStrictEqual({
        id: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    });

    it(`returns unauthorized if session token is invalid`, async () => {
      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer invalid-token`)
        .send({
          ...queries.auth.profile,
        });

      expect(body.data).toBeNull();
      expect(body.errors[0].message).toBe('Unauthorized');
    });
  });

  describe('adminRoute', () => {
    it(`allows admins`, async () => {
      const { accessToken, user } = await authUtils.getTokens({
        role: Role.Admin,
      });

      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...queries.auth.adminRoute,
        });

      expect(user.role).toBe(Role.Admin);
      expect(body.errors).toBeUndefined();
      expect(body.data.adminRoute).toBe('admin');
    });

    it(`denies users`, async () => {
      const { accessToken, user } = await authUtils.getTokens({
        role: Role.User,
      });

      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...queries.auth.adminRoute,
        });

      expect(user.role).toBe(Role.User);
      expect(body.data).toBeNull();
      expect(body.errors[0].message).toBe('Unauthorized');
    });

    it(`denies unauthenticated requests`, async () => {
      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          ...queries.auth.adminRoute,
        });

      expect(body.data).toBeNull();
      expect(body.errors[0].message).toBe('Unauthorized');
    });
  });

  describe('userRoute', () => {
    it(`allows admins`, async () => {
      const { accessToken, user } = await authUtils.getTokens({
        role: Role.Admin,
      });

      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...queries.auth.userRoute,
        });

      expect(user.role).toBe(Role.Admin);
      expect(body.errors).toBeUndefined();
      expect(body.data.userRoute).toBe('user');
    });

    it(`allows users`, async () => {
      const { accessToken, user } = await authUtils.getTokens({
        role: Role.User,
      });

      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...queries.auth.userRoute,
        });

      expect(user.role).toBe(Role.User);
      expect(body.errors).toBeUndefined();
      expect(body.data.userRoute).toBe('user');
    });

    it(`denies unauthenticated requests`, async () => {
      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          ...queries.auth.adminRoute,
        });

      expect(body.data).toBeNull();
      expect(body.errors[0].message).toBe('Unauthorized');
    });
  });

  describe('publicRoute', () => {
    it(`allows admins`, async () => {
      const { accessToken, user } = await authUtils.getTokens({
        role: Role.Admin,
      });

      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...queries.auth.publicRoute,
        });

      expect(user.role).toBe(Role.Admin);
      expect(body.errors).toBeUndefined();
      expect(body.data.publicRoute).toBe('public');
    });

    it(`allows  users`, async () => {
      const { accessToken, user } = await authUtils.getTokens({
        role: Role.User,
      });

      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...queries.auth.publicRoute,
        });

      expect(user.role).toBe(Role.User);
      expect(body.errors).toBeUndefined();
      expect(body.data.publicRoute).toBe('public');
    });

    it(`allows unauthenticated requests`, async () => {
      const { body } = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          ...queries.auth.publicRoute,
        });

      expect(body.errors).toBeUndefined();
      expect(body.data.publicRoute).toBe('public');
    });
  });
});
