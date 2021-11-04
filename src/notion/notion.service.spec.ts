import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Client as NotionClient } from '@notionhq/client';
import { ListBlockChildrenResponse } from '@notionhq/client/build/src/api-endpoints';

import { NotionService } from './notion.service';

describe(`NotionService`, () => {
  let notionService: NotionService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotionService,
        {
          provide: ConfigService,
          useValue: {},
        },
      ],
    }).compile();

    notionService = module.get<NotionService>(NotionService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it(`is defined`, () => {
    expect(notionService).toBeDefined();
  });

  describe(`getConfig`, () => {
    it(`gets the configuration`, async () => {
      configService.get = jest.fn();

      notionService.getConfig();

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

      const client = notionService.getClient();

      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(NotionClient);
      expect(configService.get).toBeCalledTimes(1);
    });

    it(`only instantiates one notion client`, async () => {
      configService.get = jest.fn().mockReturnValue({
        integrationToken: 'integration token',
        databaseID: 'database id',
      });

      notionService.getClient();
      const client = notionService.getClient();

      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(NotionClient);
      expect(configService.get).toBeCalledTimes(1);
    });
  });

  describe(`getDatabase`, () => {
    it(`calls databases.query() to retrieve DB metadata`, async () => {
      configService.get = jest.fn().mockReturnValue({
        integrationToken: 'integration token',
        databaseID: 'database id',
      });

      const notionClient = notionService.getClient();
      notionClient.databases.retrieve = jest.fn();

      await notionService.getDatabase();

      expect(notionClient.databases.retrieve).toBeCalledWith({
        database_id: expect.any(String),
      });
    });
  });

  describe(`getLessons`, () => {
    it(`calls databases.query() w/ filter of type 'lesson'`, async () => {
      configService.get = jest.fn().mockReturnValue({
        integrationToken: 'integration token',
        databaseID: 'database ID',
      });

      const notionClient = notionService.getClient();
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

      await notionService.getLessons();

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

  describe(`getExercises`, () => {
    it(`calls databases.query() w/ filter of type 'exercise'`, async () => {
      configService.get = jest.fn().mockReturnValue({
        integrationToken: 'integration token',
        databaseID: 'database ID',
      });

      const notionClient = notionService.getClient();
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
                  name: 'exercise',
                },
              },
              content_title: {
                type: 'title',
                title: [
                  {
                    plain_text: 'Exercise One',
                  },
                ],
              },
            },
          },
        ],
      });

      await notionService.getExercises();

      expect(notionClient.databases.query).toBeCalledWith({
        database_id: 'database ID',
        filter: {
          property: 'Type',
          select: {
            equals: 'exercise',
          },
        },
      });
    });
  });

  describe(`getPageBlocks`, () => {
    it(`calls blocks.children.list for a page id`, async () => {
      configService.get = jest.fn().mockReturnValue({
        integrationToken: 'integration token',
        databaseID: 'database ID',
      });

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
      const childrenBlocks: ListBlockChildrenResponse = {
        has_more: false,
        next_cursor: null,
        object: 'list',
        results,
      } as ListBlockChildrenResponse;

      const notionClient = notionService.getClient();
      notionClient.blocks.children.list = jest
        .fn()
        .mockReturnValue(childrenBlocks);

      const res = await notionService.getPageBlocks('initial block ID');

      expect(res).toStrictEqual(results);
      expect(notionClient.blocks.children.list).toBeCalledWith({
        block_id: 'initial block ID',
        start_cursor: undefined,
      });
    });

    it(`handles pagination (has_more === true)`, async () => {
      configService.get = jest.fn().mockReturnValue({
        integrationToken: 'integration token',
        databaseID: 'database ID',
      });

      const notionClient = notionService.getClient();
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

      await notionService.getPageBlocks('initial block ID');

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
      configService.get = jest.fn().mockReturnValue({
        integrationToken: 'integration token',
        databaseID: 'database ID',
      });

      const notionClient = notionService.getClient();
      notionClient.blocks.children.list = jest
        .fn()
        .mockReturnValueOnce({
          has_more: false,
          next_cursor: 'next cursor',
          object: 'list',
          results: [
            {
              object: 'block',
              id: 'block with children ID',
              created_time: '2021-11-03T12:51:00.000Z',
              last_edited_time: '2021-11-03T12:55:00.000Z',
              has_children: true,
              archived: false,
              type: 'bulleted_list_item',
              bulleted_list_item: {},
            },
          ],
        })
        .mockReturnValueOnce({
          has_more: false,
          object: 'list',
          results: [
            {
              object: 'block',
              id: 'child block ID',
              created_time: '2021-11-03T12:51:00.000Z',
              last_edited_time: '2021-11-03T12:55:00.000Z',
              has_children: false,
              archived: false,
              type: 'bulleted_list_item',
              bulleted_list_item: {},
            },
          ],
        });

      await notionService.getPageBlocks('parent block ID');

      expect(notionClient.blocks.children.list).toBeCalledWith({
        block_id: 'parent block ID',
        start_cursor: undefined,
      });
      expect(notionClient.blocks.children.list).toBeCalledWith({
        block_id: 'block with children ID',
        start_cursor: undefined,
      });
    });
  });
});
