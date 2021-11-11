import { Queue } from 'bull';
import { Client as NotionClient } from '@notionhq/client';

import { getQueueToken } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';

import { NotionAPIService } from './notion-api.service';
import { QUEUES } from '../../shared/queues';
import { JOBS } from '../../shared/jobs';

describe(`NotionAPIService`, () => {
  let module: TestingModule;
  let notionApiService: NotionAPIService;
  let configService: ConfigService;
  let apiQueue: Queue;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        NotionAPIService,
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: SchedulerRegistry,
          useValue: {
            addInterval: jest.fn(),
          },
        },
        {
          provide: getQueueToken(QUEUES.NOTION_API),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    notionApiService = module.get<NotionAPIService>(NotionAPIService);
    configService = module.get<ConfigService>(ConfigService);
    apiQueue = module.get<Queue>(getQueueToken(QUEUES.NOTION_API));
  });

  afterAll(async () => {
    await module.close();
  });

  it(`is defined`, () => {
    expect(notionApiService).toBeDefined();
  });

  describe('syncNotionTask', () => {
    let envCopy: string;

    beforeAll(() => {
      envCopy = process.env.NODE_ENV ?? 'test';
    });
    afterEach(() => {
      process.env.NODE_ENV = envCopy;
    });

    it.each`
      envType
      ${'dev'}
      ${'production'}
    `(
      `schedules SyncNotionJob for '$envType' env`,
      ({ envType }: { envType: string }) => {
        process.env.NODE_ENV = envType;
        apiQueue.add = jest.fn();

        notionApiService.syncNotionTask();

        expect(apiQueue.add).toBeCalledWith(JOBS.SYNC_NOTION);
      },
    );

    it(`doesn't schedule SyncNotionJob on 'test' env`, async () => {
      apiQueue.add = jest.fn();

      notionApiService.syncNotionTask();

      expect(apiQueue.add).not.toBeCalled();
    });
  });

  describe(`getPagesMetadata`, () => {
    it(`calls databases.query()`, async () => {
      configService.get = jest.fn().mockReturnValue({
        integrationToken: 'integration token',
        databaseID: 'database ID',
      });

      const notionClient = notionApiService.getClient();
      notionClient.databases.query = jest.fn().mockReturnValue({
        object: 'list',
        next_cursor: null,
        has_more: false,
        results: [
          {
            id: '0c73cdcb-ad0b-4f47-842d-bde407cbb81e',
            last_edited_time: '2021-11-02T20:14:00.000Z',
            properties: {
              content_type: {
                type: 'select',
                select: {
                  name: 'lesson',
                },
              },
              content_title: {
                type: 'title',
                title: [
                  {
                    plain_text: 'Lesson Two',
                  },
                ],
              },
            },
          },
        ],
      });

      await notionApiService.getPagesMetadata();

      expect(notionClient.databases.query).toBeCalledWith({
        database_id: 'database ID',
      });
    });

    it(`calls databases.query() with filter`, async () => {
      configService.get = jest.fn().mockReturnValue({
        integrationToken: 'integration token',
        databaseID: 'database ID',
      });

      const notionClient = notionApiService.getClient();
      notionClient.databases.query = jest.fn().mockReturnValue({
        object: 'list',
        next_cursor: null,
        has_more: false,
        results: [
          {
            id: '0c73cdcb-ad0b-4f47-842d-bde407cbb81e',
            last_edited_time: '2021-11-02T20:14:00.000Z',
            properties: {
              content_type: {
                type: 'select',
                select: {
                  name: 'lesson',
                },
              },
              content_title: {
                type: 'title',
                title: [
                  {
                    plain_text: 'Lesson Two',
                  },
                ],
              },
            },
          },
        ],
      });

      await notionApiService.getPagesMetadata({
        property: 'Type',
        select: {
          equals: 'lesson',
        },
      });

      expect(notionClient.databases.query).toBeCalledWith({
        database_id: 'database ID',
        filter: {
          property: 'Type',
          select: {
            equals: 'lesson',
          },
        },
      });
    });
  });

  describe('getBlockMetadata', () => {
    it(`retrieves block metadata`, async () => {
      configService.get = jest.fn().mockReturnValue({
        integrationToken: 'integration token',
        databaseID: 'database ID',
      });

      const data = {
        id: '0c73cdcb-ad0b',
        type: 'object',
        object: 'paragraph',
        created_time: '2021-11-02T20:13:00.000Z',
        last_edited_time: '2021-11-02T20:13:00.000Z',
        has_children: false,
      };
      const client = notionApiService.getClient();
      client.blocks.retrieve = jest.fn().mockReturnValue(data);

      const res = await notionApiService.getBlockMetadata('0c73cdcb-ad0b');

      expect(res).toStrictEqual(data);
      expect(client.blocks.retrieve).toBeCalledWith({
        block_id: '0c73cdcb-ad0b',
      });
    });
  });

  describe(`getChildrenBlocks`, () => {
    beforeEach(() => {
      configService.get = jest.fn().mockReturnValue({
        integrationToken: 'integration token',
        databaseID: 'database ID',
      });
    });

    it(`calls blocks.children.list for a page id`, async () => {
      const results = [
        {
          object: 'block',
          id: '78f83fc9-8fc1-4d63-a526-8c9e178bb8c2',
          created_time: '2021-11-03T12:51:00.000Z',
          last_edited_time: '2021-11-03T12:55:00.000Z',
          has_children: false,
          archived: false,
          type: 'bulleted_list_item',
          bulleted_list_item: {},
        },
        {
          object: 'block',
          id: 'e5f8aa09-f2a7-4573-a9cb-e73ee75ec2b9',
          created_time: '2021-11-03T12:55:00.000Z',
          last_edited_time: '2021-11-03T14:52:00.000Z',
          has_children: false,
          archived: false,
          type: 'bulleted_list_item',
          bulleted_list_item: {},
        },
      ];
      const childrenBlocks = {
        has_more: false,
        next_cursor: null,
        object: 'list',
        results,
      };
      const notionClient = notionApiService.getClient();
      notionClient.blocks.children.list = jest
        .fn()
        .mockReturnValue(childrenBlocks);

      const res = await notionApiService.getChildrenBlocks('initial block ID');

      expect(res).toStrictEqual({
        childrenBlocks: results,
        parentBlocks: [],
      });
      expect(notionClient.blocks.children.list).toBeCalledWith({
        block_id: 'initial block ID',
        start_cursor: undefined,
      });
    });

    it(`handles pagination (has_more === true)`, async () => {
      const notionClient = notionApiService.getClient();
      notionClient.blocks.children.list = jest
        .fn()
        .mockReturnValueOnce({
          has_more: true,
          next_cursor: 'next cursor',
          object: 'list',
          results: ['page 1'],
        })
        .mockReturnValueOnce({
          has_more: false,
          object: 'list',
          results: ['page 2'],
        });

      const res = await notionApiService.getChildrenBlocks('initial block ID');

      expect(res).toStrictEqual({
        childrenBlocks: ['page 1', 'page 2'],
        parentBlocks: [],
      });
      expect(notionClient.blocks.children.list).toBeCalledWith({
        block_id: 'initial block ID',
        start_cursor: undefined,
      });
      expect(notionClient.blocks.children.list).toBeCalledWith({
        block_id: 'initial block ID',
        start_cursor: 'next cursor',
      });
    });

    it(`adds children blocks to the results (has_children === true)`, async () => {
      const blockWithChildren = {
        object: 'block',
        id: 'block with children ID',
        created_time: '2021-11-03T12:51:00.000Z',
        last_edited_time: '2021-11-03T12:55:00.000Z',
        has_children: true,
        archived: false,
        type: 'bulleted_list_item',
        bulleted_list_item: {},
      };
      const notionClient = notionApiService.getClient();
      notionClient.blocks.children.list = jest.fn().mockReturnValueOnce({
        has_more: false,
        next_cursor: 'next cursor',
        object: 'list',
        results: [blockWithChildren],
      });

      const res = await notionApiService.getChildrenBlocks('parent block ID');

      expect(notionClient.blocks.children.list).toBeCalledWith({
        block_id: 'parent block ID',
        start_cursor: undefined,
      });
      expect(res).toStrictEqual({
        childrenBlocks: [blockWithChildren],
        parentBlocks: ['block with children ID'],
      });
    });
  });

  describe(`getConfig`, () => {
    it(`gets the configuration`, async () => {
      configService.get = jest.fn();

      notionApiService.getConfig();

      expect(configService.get).toBeCalledWith('notion', {
        infer: true,
      });
    });
  });

  describe(`getClient`, () => {
    it(`gets an instance of notion client`, async () => {
      configService.get = jest.fn().mockReturnValue({
        integrationToken: 'integration token',
        databaseID: 'database id',
      });

      const client = notionApiService.getClient();

      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(NotionClient);
      expect(configService.get).toBeCalledTimes(1);
    });

    it(`only instantiates one notion client`, async () => {
      configService.get = jest.fn().mockReturnValue({
        integrationToken: 'integration token',
        databaseID: 'database id',
      });

      notionApiService.getClient();
      const client = notionApiService.getClient();

      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(NotionClient);
      expect(configService.get).toBeCalledTimes(1);
    });
  });
});
