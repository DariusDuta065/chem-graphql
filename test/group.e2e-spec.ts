import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { TestUtils, AuthUtils } from './utils';

import { AppModule } from 'src/app/app.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

import { User } from 'src/user/user.entity';
import { Group } from 'src/group/group.entity';
import { Content } from 'src/content/content.entity';

import { Role } from 'src/auth/enums/role.enum';
import { NotionAPIProcessor } from 'src/notion/processors';
import { CreateGroupInput } from 'src/group/dto/create-group.input';
import { UpdateGroupInput } from 'src/group/dto/update-group.input';

import queries from './graphql/queries';
import mutations from './graphql/mutations';

describe('GroupResolver (e2e)', () => {
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

  const loadUsers = async (count = 2): Promise<User[]> => {
    const users: User[] = [];

    for (let i = 1; i <= count; i++) {
      users.push(
        await authUtils.createUser({
          role: Role.User,
        }),
      );
    }

    return users;
  };

  it(`creates a new group & queries for it afterwards`, async () => {
    const { accessToken } = await authUtils.getTokens({
      role: Role.Admin,
    });

    const createGroupInput: CreateGroupInput = {
      grade: 11,
      notes: 'notes',
      scheduleDay: 1,
      scheduleHour: 12,
      scheduleMinute: 30,
    };

    const {
      body: { data: createData },
    } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...mutations.groups.createGroup,
        variables: {
          createGroupInput,
        },
      });

    const createdGroup: Group = createData.createGroup;

    expect(createdGroup).toStrictEqual({
      id: expect.any(Number),
      grade: createGroupInput.grade,
      notes: createGroupInput.notes,
      scheduleDay: createGroupInput.scheduleDay,
      scheduleHour: createGroupInput.scheduleHour,
      scheduleMinute: createGroupInput.scheduleMinute,
      users: [],
      contents: [],
    });

    const {
      body: { data: fetchData },
    } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...queries.groups.group,
        variables: {
          groupId: createdGroup.id,
        },
      });

    const fetchedGroup: Group = fetchData.group;
    expect(fetchedGroup).toStrictEqual(createdGroup);
  });

  it(`updates a group's own fields`, async () => {
    const { accessToken } = await authUtils.getTokens({
      role: Role.Admin,
    });

    const createGroupInput: CreateGroupInput = {
      grade: 11,
      notes: 'notes',
      scheduleDay: 1,
      scheduleHour: 12,
      scheduleMinute: 30,
    };

    const {
      body: { data: createData },
    } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...mutations.groups.createGroup,
        variables: {
          createGroupInput,
        },
      });
    const createdGroup: Group = createData.createGroup;

    expect(createdGroup).toStrictEqual({
      id: expect.any(Number),
      grade: createGroupInput.grade,
      notes: createGroupInput.notes,
      scheduleDay: createGroupInput.scheduleDay,
      scheduleHour: createGroupInput.scheduleHour,
      scheduleMinute: createGroupInput.scheduleMinute,
      users: [],
      contents: [],
    });

    const updateGroupInput: UpdateGroupInput = {
      id: createdGroup.id,
      grade: 12,
      notes: 'new notes',
      scheduleDay: 2,
      scheduleHour: 14,
      scheduleMinute: 45,
      contents: [],
      users: [],
    };

    const {
      body: { data: updateData },
    } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...mutations.groups.updateGroup,
        variables: {
          updateGroupInput,
        },
      });

    const updatedGroup: Group = updateData.updateGroup;

    expect(updatedGroup).toStrictEqual({
      id: createdGroup.id,
      grade: updateGroupInput.grade,
      notes: updateGroupInput.notes,
      scheduleDay: updateGroupInput.scheduleDay,
      scheduleHour: updateGroupInput.scheduleHour,
      scheduleMinute: updateGroupInput.scheduleMinute,
      users: [],
      contents: [],
    });
  });

  it(`updates a group's users`, async () => {
    const { accessToken } = await authUtils.getTokens({
      role: Role.Admin,
    });

    // Create new group
    const createGroupInput: CreateGroupInput = {
      grade: 11,
      notes: 'notes',
      scheduleDay: 1,
      scheduleHour: 12,
      scheduleMinute: 30,
    };

    const {
      body: { data: createData },
    } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...mutations.groups.createGroup,
        variables: {
          createGroupInput,
        },
      });
    const createdGroup: Group = createData.createGroup;

    expect(createdGroup).toStrictEqual({
      id: expect.any(Number),
      grade: createGroupInput.grade,
      notes: createGroupInput.notes,
      scheduleDay: createGroupInput.scheduleDay,
      scheduleHour: createGroupInput.scheduleHour,
      scheduleMinute: createGroupInput.scheduleMinute,
      users: [],
      contents: [],
    });

    // Load users into DB
    const users = await loadUsers();
    const userIDs = users.map((u) => u.userId);

    // Update group to associate these users to it
    const updateGroupInput: UpdateGroupInput = {
      id: createdGroup.id,
      grade: 12,
      notes: 'new notes',
      scheduleDay: 2,
      scheduleHour: 14,
      scheduleMinute: 45,
      contents: [],
      users: userIDs,
    };

    const {
      body: { data: updateData },
    } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...mutations.groups.updateGroup,
        variables: {
          updateGroupInput,
        },
      });

    const updatedGroup: Group = updateData.updateGroup;

    expect(updatedGroup).toStrictEqual({
      id: createdGroup.id,
      grade: updateGroupInput.grade,
      notes: updateGroupInput.notes,
      scheduleDay: updateGroupInput.scheduleDay,
      scheduleHour: updateGroupInput.scheduleHour,
      scheduleMinute: updateGroupInput.scheduleMinute,
      contents: [],
      users: [
        { userId: users[0].userId, email: users[0].email },
        { userId: users[1].userId, email: users[1].email },
      ],
    });
  });

  it(`updates a group's contents`, async () => {
    const { accessToken } = await authUtils.getTokens({
      role: Role.Admin,
    });

    // Create new group
    const createGroupInput: CreateGroupInput = {
      grade: 11,
      notes: 'notes',
      scheduleDay: 1,
      scheduleHour: 12,
      scheduleMinute: 30,
    };

    const {
      body: { data: createData },
    } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...mutations.groups.createGroup,
        variables: {
          createGroupInput,
        },
      });
    const createdGroup: Group = createData.createGroup;

    expect(createdGroup).toStrictEqual({
      id: expect.any(Number),
      grade: createGroupInput.grade,
      notes: createGroupInput.notes,
      scheduleDay: createGroupInput.scheduleDay,
      scheduleHour: createGroupInput.scheduleHour,
      scheduleMinute: createGroupInput.scheduleMinute,
      users: [],
      contents: [],
    });

    // Load contents into DB
    const contents = await loadContents();
    const contentIDs = contents.map((c) => c.id);

    // Update group to associate these contents to it
    const updateGroupInput: UpdateGroupInput = {
      id: createdGroup.id,
      grade: 12,
      notes: 'new notes',
      scheduleDay: 2,
      scheduleHour: 14,
      scheduleMinute: 45,
      users: [],
      contents: contentIDs,
    };

    const {
      body: { data: updateData },
    } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...mutations.groups.updateGroup,
        variables: {
          updateGroupInput,
        },
      });

    const updatedGroup: Group = updateData.updateGroup;

    expect(updatedGroup).toStrictEqual({
      id: createdGroup.id,
      grade: updateGroupInput.grade,
      notes: updateGroupInput.notes,
      scheduleDay: updateGroupInput.scheduleDay,
      scheduleHour: updateGroupInput.scheduleHour,
      scheduleMinute: updateGroupInput.scheduleMinute,
      users: [],
      contents: [
        {
          id: contents[0].id,
          blockID: contents[0].blockID,
          lastEditedAt: contents[0].lastEditedAt.toISOString(),
        },
        {
          id: contents[1].id,
          blockID: contents[1].blockID,
          lastEditedAt: contents[1].lastEditedAt.toISOString(),
        },
      ],
    });
  });

  it(`deletes a group successfully`, async () => {
    const { accessToken } = await authUtils.getTokens({
      role: Role.Admin,
    });

    const createGroupInput: CreateGroupInput = {
      grade: 11,
      notes: 'notes',
      scheduleDay: 1,
      scheduleHour: 12,
      scheduleMinute: 30,
    };

    const {
      body: { data: createData },
    } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...mutations.groups.createGroup,
        variables: {
          createGroupInput,
        },
      });

    const createdGroup: Group = createData.createGroup;

    expect(createdGroup).toStrictEqual({
      id: expect.any(Number),
      grade: createGroupInput.grade,
      notes: createGroupInput.notes,
      scheduleDay: createGroupInput.scheduleDay,
      scheduleHour: createGroupInput.scheduleHour,
      scheduleMinute: createGroupInput.scheduleMinute,
      users: [],
      contents: [],
    });

    const {
      body: { data: deletedData },
    } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...mutations.groups.deleteGroup,
        variables: {
          groupId: createdGroup.id,
        },
      });

    expect(deletedData.deleteGroup).toBeTruthy();
  });

  it(`blocks regular users from using group resolver`, async () => {
    const { accessToken } = await authUtils.getTokens({
      role: Role.User,
    });

    const { body } = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...queries.groups.groups,
      });

    expect(body.errors).toBeDefined();
    expect(body.errors[0].message).toBe(`Unauthorized`);
  });
});
