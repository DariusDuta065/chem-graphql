import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { TestUtils, AuthUtils } from './utils';

import { AppModule } from '../src/app/app.module';
import { UserModule } from '../src/user/user.module';
import { AuthModule } from '../src/auth/auth.module';

import { User } from '../src/user/user.entity';
import { Group } from '../src/group/group.entity';
import { Content } from '../src/content/content.entity';

import { Role } from '../src/auth/enums/role.enum';
import { NotionAPIProcessor } from '../src/notion/processors';

import queries from './graphql/queries';

describe('ContentResolver (e2e)', () => {
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

  const loadContents = async (): Promise<Content[]> => {
    const contents = [
      {
        blockID: '0c73cdcb-ad0b-4f47-842d-bde407cbb81e',
        title: 'content title 1',
        type: 'content type 1',
        lastEditedAt: new Date('2021-11-11 20:56:00'),
        blocks: 'content blocks 1',
      },
      {
        blockID: 'c45d8cde-a118-472b-a566-a7d0456405fd',
        title: 'content title 2',
        type: 'content type 2',
        lastEditedAt: new Date('2021-11-18 10:30:00'),
        blocks: 'content blocks 2',
      },
    ] as Content[];

    await testUtils.load<Content>(contents, Content.name);
    return await testUtils.getAll<Content>(Content.name);
  };

  const loadGroup = async (
    users: User[] = [],
    contents: Content[] = [],
  ): Promise<Group> => {
    const groupData = {
      grade: 12,
      notes: 'group notes',
      scheduleDay: 1,
      scheduleHour: 12,
      scheduleMinute: 30,
    } as Group;

    await testUtils.load<Group>(groupData, Group.name);
    const group = (await testUtils.getAll<Group>(Group.name))[0];
    return await testUtils.updateGroup(group.id, users, contents);
  };

  it(`fetches all content for admins`, async () => {
    const { accessToken: adminToken } = await authUtils.getTokens({
      role: Role.Admin,
    });

    const content = await loadContents();

    const {
      body: { data: fetchData },
    } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...queries.contents.contents,
      });

    expect(fetchData.contents).toContainEqual({
      ...content[0],
      lastEditedAt: content[0].lastEditedAt.toISOString(),
    });
    expect(fetchData.contents).toContainEqual({
      ...content[1],
      lastEditedAt: content[1].lastEditedAt.toISOString(),
    });
  });

  it(`fetches content by ID for admins`, async () => {
    const { accessToken: adminToken } = await authUtils.getTokens({
      role: Role.Admin,
    });

    const content = await loadContents();

    const {
      body: { data: fetchData },
    } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...queries.contents.content,
        variables: {
          contentId: content[0].id,
        },
      });

    expect(fetchData.content).toStrictEqual({
      ...content[0],
      lastEditedAt: content[0].lastEditedAt.toISOString(),
    });
  });

  it(`only returns available content for user's group`, async () => {
    const { user, accessToken: userToken } = await authUtils.getTokens({
      role: Role.User,
    });

    const contents = await loadContents();

    // only give group access to `contents[0]`
    const group = await loadGroup([user], [contents[0]]);

    const groupContents = await group.contents;
    const groupUsers = await group.users;

    expect(groupContents).toStrictEqual([contents[0]]);
    expect(groupUsers).toContain(user);

    const {
      body: { data: fetchData },
    } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        ...queries.contents.contents,
      });

    expect(fetchData.contents).toHaveLength(1);

    // `contents[0]` should be made available to the user
    expect(fetchData.contents).toContainEqual({
      ...contents[0],
      lastEditedAt: contents[0].lastEditedAt.toISOString(),
    });

    // `contents[1]` should not be available to the user
    expect(fetchData.contents).not.toContainEqual({
      ...contents[1],
      lastEditedAt: contents[1].lastEditedAt.toISOString(),
    });
  });

  it(`returns content by ID if available to the user's group`, async () => {
    const { user, accessToken: userToken } = await authUtils.getTokens({
      role: Role.User,
    });

    const contents = await loadContents();

    // only give group access to `contents[1]`
    const group = await loadGroup([user], [contents[1]]);

    const groupContents = await group.contents;
    const groupUsers = await group.users;

    expect(groupContents).toStrictEqual([contents[1]]);
    expect(groupUsers).toContain(user);

    // contents[0] is not available to the user's group
    const {
      body: { data: fetchData },
    } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        ...queries.contents.content,
        variables: {
          contentId: contents[0].id,
        },
      });

    expect(fetchData.content).toBeNull();

    // contents[1] is available to the user's group
    const {
      body: { data: fetchData2 },
    } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        ...queries.contents.content,
        variables: {
          contentId: contents[1].id,
        },
      });

    expect(fetchData2.content).toStrictEqual({
      ...contents[1],
      lastEditedAt: contents[1].lastEditedAt.toISOString(),
    });
  });
});
