import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { TestUtils, AuthUtils } from './utils';

import { AppModule } from 'src/app/app.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

import { User } from 'src/user/user.entity';
import { Role } from 'src/auth/enums/role.enum';
import { NotionAPIProcessor } from 'src/notion/processors';
import { UpdateUserInput } from 'src/user/dto/update-user.input';

import queries from './graphql/queries';
import mutations from './graphql/mutations';

describe('UserResolver (e2e)', () => {
  let app: INestApplication;

  let testUtils: TestUtils;
  let authUtils: AuthUtils;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule, UserModule, AuthModule],
      providers: [TestUtils, AuthUtils],
    })
      .overrideProvider(NotionAPIProcessor)
      .useValue({})
      .compile();

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

  afterEach(async () => {
    await testUtils.cleanAll();
  });

  it(`queries for all users`, async () => {
    const { user: adminUser, accessToken: adminToken } =
      await authUtils.getTokens({
        role: Role.Admin,
      });

    const newUser1 = await authUtils.createUser({
      role: Role.User,
    });
    const newUser2 = await authUtils.createUser({
      role: Role.User,
    });

    const { body } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...queries.users.users,
      });

    const users: User[] = body.data.users;
    const userIDs = users.map((u) => u.id);

    // Admins are not returned by this resolver
    expect(userIDs).not.toContain(adminUser.id);

    expect(userIDs).toContain(newUser1.id);
    expect(userIDs).toContain(newUser2.id);

    expect(users).toContainEqual({
      id: newUser1.id,
      email: newUser1.email,
      firstName: newUser1.firstName,
      lastName: newUser1.lastName,
      role: 'User',
      group: null,
    });
    expect(users).toContainEqual({
      id: newUser2.id,
      email: newUser2.email,
      firstName: newUser2.firstName,
      lastName: newUser2.lastName,
      role: 'User',
      group: null,
    });
  });

  it(`queries for user by ID`, async () => {
    const { accessToken: adminToken } = await authUtils.getTokens({
      role: Role.Admin,
    });

    const newUser = await authUtils.createUser({
      role: Role.User,
    });

    const { body } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...queries.users.user,
        variables: {
          userId: newUser.id,
        },
      });

    expect(body.data.user).toStrictEqual({
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: 'User',
      group: null,
    });
  });

  it(`creates & then updates user`, async () => {
    const { accessToken: adminToken } = await authUtils.getTokens({
      role: Role.Admin,
    });

    const newUser = await authUtils.createUser({
      role: Role.User,
    });

    // Validate new user's creation
    const {
      body: { data: createData },
    } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...queries.users.user,
        variables: {
          userId: newUser.id,
        },
      });

    const user: User = createData.user;
    expect(user).toStrictEqual({
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: 'User',
      group: null,
    });

    // Update user & check for new data
    const updateUserInput: UpdateUserInput = {
      id: user.id,
      email: 'new_email@test.com',
      firstName: 'new first name',
      lastName: 'new last name',
    };

    const {
      body: { data: updateData },
    } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...mutations.users.updateUser,
        variables: {
          updateUserInput,
        },
      });

    const updatedUser: User = updateData.updateUser;
    expect(updatedUser).toStrictEqual({
      id: user.id,
      email: updateUserInput.email,
      firstName: updateUserInput.firstName,
      lastName: updateUserInput.lastName,
      role: 'User',
    });
  });

  it(`creates & then deletes a user`, async () => {
    const { accessToken: adminToken } = await authUtils.getTokens({
      role: Role.Admin,
    });

    const newUser = await authUtils.createUser({
      role: Role.User,
    });

    // Validate new user's creation
    const {
      body: { data: createData },
    } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...queries.users.user,
        variables: {
          userId: newUser.id,
        },
      });

    const user: User = createData.user;
    expect(user).toStrictEqual({
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: 'User',
      group: null,
    });

    // Delete user
    const {
      body: { data: deleteData },
    } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...mutations.users.deleteUser,
        variables: {
          userId: user.id,
        },
      });

    expect(deleteData.deleteUser).toBeTruthy();

    // Check for existence after deleting user
    const {
      body: { data: fetchData },
    } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...queries.users.user,
        variables: {
          userId: user.id,
        },
      });

    expect(fetchData.user).toBeNull();
  });

  it(`blocks regular users from using group resolver`, async () => {
    const { accessToken: userToken } = await authUtils.getTokens({
      role: Role.User,
    });

    const { body } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        ...queries.users.users,
      });

    expect(body.errors).toBeDefined();
    expect(body.errors[0].message).toBe(`Unauthorized`);
  });
});
