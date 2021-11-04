import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Client as NotionClient } from '@notionhq/client';
import { ListBlockChildrenResponse } from '@notionhq/client/build/src/api-endpoints';

import configuration from '../config/configuration';
import { NotionService } from './notion.service';
import { NotionBlock } from './types';

describe(`NotionService`, () => {
  let notionService: NotionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          cache: true,
          isGlobal: true,
          load: [configuration],
        }),
      ],
      providers: [NotionService],
    }).compile();

    notionService = module.get<NotionService>(NotionService);
  });

  it(`is defined`, () => {
    expect(notionService).toBeDefined();
  });

  describe(`getConfig`, () => {
    it(`gets the configuration`, async () => {
      const config = notionService.getConfig();

      expect(config).toBeDefined();
      expect(config.databaseID).toEqual(expect.any(String));
      expect(config.integrationToken).toEqual(expect.any(String));
    });
  });

  describe(`getClient`, () => {
    it(`gets an instance of notion client`, async () => {
      const client = notionService.getClient();

      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(NotionClient);
    });
  });

  describe(`getDatabase`, () => {
    it(`calls notion sdk to retrieve DB`, async () => {
      const notionClient = notionService.getClient();
      notionClient.databases.retrieve = jest.fn();

      await notionService.getDatabase();

      expect(notionClient.databases.retrieve).toBeCalledWith({
        database_id: expect.any(String),
      });
    });
  });

  describe(`getLessons`, () => {
    it(`calls getPages() w/ filter of type 'lesson'`, async () => {
      const pageResults = ['page 1', 'page 2'];

      // Mock notionClient.databases.query
      // - check filter applied
      // - mock result then check result of getLessons() to match !final res
      // which goes through a parsePageResults() call...

      const frsSpy = jest
        .spyOn(NotionService.prototype as any, 'getPagesByType')
        .mockReturnValue(pageResults);

      const scnSpy = jest
        .spyOn(NotionService.prototype as any, 'parsePageResults')
        .mockReturnValue(pageResults);
      // notionService.getPagesByType = jest.fn().mockReturnValue(pageResults);
      // notionService.parsePageResults = jest.fn();

      await notionService.getLessons();

      expect(frsSpy).toBeCalledWith('lesson');
      expect(scnSpy).toBeCalledWith(pageResults);
    });
  });

  // describe(`getExercises`, () => {
  //   it(`calls getPages() w/ filter of type 'exercise'`, async () => {
  //     const pageResults = ['page 1', 'page 2'];

  //     notionService.getPagesByType = jest.fn().mockReturnValue(pageResults);
  //     notionService.parsePageResults = jest.fn();

  //     await notionService.getExercises();

  //     expect(notionService.getPagesByType).toBeCalledWith('exercise');
  //     expect(notionService.parsePageResults).toBeCalledWith(pageResults);
  //   });
  // });

  // describe(`getPageBlocks`, () => {
  //   it(`gets the blocks for a pageID`, async () => {
  //     const pageID = 'initial block ID';
  //     const results = [
  //       {
  //         object: 'block',
  //         id: '78f83fc9-8fc1-4d63-a526-8c9e178bb8c2',
  //         created_time: '2021-11-03T12:51:00.000Z',
  //         last_edited_time: '2021-11-03T12:55:00.000Z',
  //         has_children: false,
  //         archived: false,
  //         type: 'bulleted_list_item',
  //         bulleted_list_item: {},
  //       },
  //       {
  //         object: 'block',
  //         id: 'e5f8aa09-f2a7-4573-a9cb-e73ee75ec2b9',
  //         created_time: '2021-11-03T12:55:00.000Z',
  //         last_edited_time: '2021-11-03T14:52:00.000Z',
  //         has_children: false,
  //         archived: false,
  //         type: 'bulleted_list_item',
  //         bulleted_list_item: {},
  //       },
  //     ];
  //     const childrenBlocks: ListBlockChildrenResponse = {
  //       has_more: false,
  //       next_cursor: 'next cursor',
  //       object: 'list',
  //       results,
  //     } as ListBlockChildrenResponse;

  //     notionService.getBlocksChildren = jest
  //       .fn()
  //       .mockReturnValue(childrenBlocks);

  //     const res = await notionService.getPageBlocks(pageID);

  //     expect(res).toStrictEqual(results);
  //     expect(notionService.getBlocksChildren).toBeCalledWith(pageID, undefined);
  //   });

  //   it(`handles pagination (has_more)`, async () => {
  //     const pageID = 'initial block ID';
  //     notionService.getBlocksChildren = jest
  //       .fn()
  //       .mockReturnValueOnce({
  //         has_more: true,
  //         next_cursor: 'next cursor',
  //         object: 'list',
  //         results: ['page 1'],
  //       })
  //       .mockReturnValueOnce({
  //         has_more: false,
  //         object: 'list',
  //         results: ['page 2'],
  //       });

  //     const res = await notionService.getPageBlocks(pageID);

  //     expect(notionService.getBlocksChildren).toBeCalledWith(pageID, undefined);
  //     expect(notionService.getBlocksChildren).toBeCalledWith(
  //       pageID,
  //       'next cursor',
  //     );
  //     expect(res).toStrictEqual(['page 1', 'page 2']);
  //   });

  //   it(`recursively adds children blocks to the results (has_children)`, async () => {
  //     const pageID = 'initial block ID';

  //     const parentBlock = {
  //       object: 'block',
  //       id: 'page with children ID',
  //       created_time: '2021-11-03T12:51:00.000Z',
  //       last_edited_time: '2021-11-03T12:55:00.000Z',
  //       has_children: true,
  //       archived: false,
  //       type: 'bulleted_list_item',
  //       bulleted_list_item: {
  //         properties: ['props'],
  //       },
  //     };
  //     const childBlock = {
  //       object: 'block',
  //       id: 'child page ID',
  //       created_time: '2021-11-03T12:51:00.000Z',
  //       last_edited_time: '2021-11-03T12:55:00.000Z',
  //       has_children: false,
  //       archived: false,
  //       type: 'bulleted_list_item',
  //       bulleted_list_item: {},
  //     };

  //     notionService.getBlocksChildren = jest
  //       .fn()
  //       .mockReturnValueOnce({
  //         object: 'list',
  //         results: [parentBlock],
  //       })
  //       .mockReturnValueOnce({
  //         object: 'list',
  //         results: [childBlock],
  //       });

  //     const res = await notionService.getPageBlocks(pageID);
  //     console.log('yoo', res);

  //     expect(res).toStrictEqual([
  //       {
  //         ...parentBlock,
  //         bulleted_list_item: {
  //           ...parentBlock.bulleted_list_item,
  //           children: [childBlock],
  //         },
  //       },
  //     ]);

  //     expect(notionService.getBlocksChildren).toBeCalledWith(
  //       'initial block ID',
  //       undefined,
  //     );
  //     expect(notionService.getBlocksChildren).toBeCalledWith(
  //       'page with children ID',
  //       undefined,
  //     );
  //   });
  // });

  describe('parsePageResults', () => {
    it(``, async () => {
      //
    });
  });

  describe('getBlocksChildren', () => {
    it(``, async () => {
      //
    });
  });

  describe('getPagesByType', () => {
    it(``, async () => {
      //
    });
  });
});
