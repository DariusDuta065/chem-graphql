import { Queue } from 'bull';

import { EventBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';

import { NotionAPIProcessor } from '.';
import { NotionAPIService, NotionBlockService } from '../services';
import { ContentService } from '../../content/content.service';

import { JOBS } from '../../shared/jobs';
import { QUEUES } from '../../shared/queues';
import {
  NotionPageCreatedEvent,
  NotionPageDeletedEvent,
  NotionPageUpdatedEvent,
} from '../events';
import { Content } from 'src/content/content.entity';

describe('NotionAPIProcessor', () => {
  let processor: NotionAPIProcessor;
  let eventBus: EventBus;

  let notionApiService: NotionAPIService;
  let contentService: ContentService;

  let apiQueue: Queue;
  let blocksQueue: Queue;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotionAPIProcessor,
        {
          provide: ContentService,
          useValue: {},
        },
        {
          provide: NotionAPIService,
          useValue: {},
        },
        {
          provide: getQueueToken(QUEUES.NOTION_API),
          useValue: {},
        },
        {
          provide: getQueueToken(QUEUES.NOTION_BLOCKS),
          useValue: {},
        },
        {
          provide: EventBus,
          useValue: {},
        },
      ],
    }).compile();

    processor = module.get<NotionAPIProcessor>(NotionAPIProcessor);
    eventBus = module.get<EventBus>(EventBus);

    notionApiService = module.get<NotionAPIService>(NotionAPIService);
    contentService = module.get<ContentService>(ContentService);

    apiQueue = module.get<Queue>(getQueueToken(QUEUES.NOTION_API));
    blocksQueue = module.get<Queue>(getQueueToken(QUEUES.NOTION_BLOCKS));
  });

  it(`is defined`, async () => {
    expect(processor).toBeDefined();
  });

  describe('syncNotionJob', () => {
    it(`fetches the blocks from Notion's API`, async () => {
      const notionBlocks = [
        {
          id: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
          lastEditedAt: '2021-11-08T20:14:00.000Z',
          type: 'lesson',
          title: 'Title One',
        },
        {
          id: '9dd90a4c-58bc-436d-8a7f-adca881c3215',
          lastEditedAt: '2021-11-07T14:51:00.000Z',
          type: 'exercise',
          title: 'Title Two',
        },
      ];
      const contents = [
        {
          blockID: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
          isUpdating: false,
          lastEditedAt: new Date('2021-11-02T03:02:55.000Z'),
          type: 'lesson',
          title: 'Title One',
          blocks: '[...]',
        },
        {
          blockID: '1336e560-26ba-44c0-b7d0-59d058cab8fa',
          isUpdating: false,
          lastEditedAt: new Date('2021-11-08T03:04:10.000Z'),
          type: 'exercise',
          title: 'Title Three',
          blocks: '[...]',
        },
      ];

      Logger.debug = jest.fn();
      const getBlocksDifferencesSpy = jest.spyOn(
        NotionBlockService,
        'getBlocksDifferences',
      );
      notionApiService.getPagesMetadata = jest
        .fn()
        .mockReturnValue(notionBlocks);
      contentService.getContent = jest.fn().mockReturnValue(contents);

      blocksQueue.add = jest.fn();
      apiQueue.add = jest.fn();
      eventBus.publish = jest.fn();

      await processor.syncNotionJob();

      expect(notionApiService.getPagesMetadata).toBeCalled();
      expect(contentService.getContent).toBeCalled();
      expect(getBlocksDifferencesSpy).toBeCalledWith(
        [
          '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
          '9dd90a4c-58bc-436d-8a7f-adca881c3215',
        ],
        [
          '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
          '1336e560-26ba-44c0-b7d0-59d058cab8fa',
        ],
      );
    });

    it(`handles errors from Notion's API`, async () => {
      const contents = [
        {
          blockID: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
          isUpdating: false,
          lastEditedAt: new Date('2021-11-02T03:02:55.000Z'),
          type: 'lesson',
          title: 'Title One',
          blocks: '[...]',
        },
        {
          blockID: '1336e560-26ba-44c0-b7d0-59d058cab8fa',
          isUpdating: false,
          lastEditedAt: new Date('2021-11-08T03:04:10.000Z'),
          type: 'exercise',
          title: 'Title Three',
          blocks: '[...]',
        },
      ];

      Logger.debug = jest.fn();
      jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());

      notionApiService.getPagesMetadata = jest.fn(async () => {
        throw new Error('Notion API error');
      });

      contentService.getContent = jest.fn().mockReturnValue(contents);

      blocksQueue.add = jest.fn();
      apiQueue.add = jest.fn();

      expect(processor.syncNotionJob()).rejects.toThrowError(
        'Notion API error',
      );
    });

    it(`handles errors if blocks cannot be found`, async () => {
      const notionBlocks = [
        {
          id: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
          lastEditedAt: '2021-11-08T20:14:00.000Z',
          type: 'lesson',
          title: 'Title One',
        },
        {
          id: '9dd90a4c-58bc-436d-8a7f-adca881c3215',
          lastEditedAt: '2021-11-07T14:51:00.000Z',
          type: 'exercise',
          title: 'Title Two',
        },
      ];
      const contents = [
        {
          blockID: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
          isUpdating: false,
          lastEditedAt: new Date('2021-11-02T03:02:55.000Z'),
          type: 'lesson',
          title: 'Title One',
          blocks: '[...]',
        },
        {
          blockID: '1336e560-26ba-44c0-b7d0-59d058cab8fa',
          isUpdating: false,
          lastEditedAt: new Date('2021-11-08T03:04:10.000Z'),
          type: 'exercise',
          title: 'Title Three',
          blocks: '[...]',
        },
      ];

      const mockWarn = jest.fn();
      jest.spyOn(Logger.prototype, 'warn').mockImplementation(mockWarn);
      notionApiService.getPagesMetadata = jest
        .fn()
        .mockReturnValue(notionBlocks);
      contentService.getContent = jest.fn().mockReturnValue(contents);

      jest
        .spyOn(Array.prototype as any, 'find')
        .mockImplementationOnce(() => undefined)
        .mockImplementationOnce(() => undefined)
        .mockImplementationOnce(() => undefined);

      await processor.syncNotionJob();

      expect(notionApiService.getPagesMetadata).toBeCalled();
      expect(contentService.getContent).toBeCalled();

      [
        '9dd90a4c-58bc-436d-8a7f-adca881c3215',
        '1336e560-26ba-44c0-b7d0-59d058cab8fa',
        '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
      ].forEach((id) => {
        expect(mockWarn).toBeCalledWith(`Notion block ${id} not found`);
      });
    });

    it(`handles page creation for pages that are in Notion but not in DB`, async () => {
      const notionBlocks = [
        {
          id: '9dd90a4c-58bc-436d-8a7f-adca881c3215',
          lastEditedAt: '2021-11-07T14:51:00.000Z',
          type: 'exercise',
          title: 'Title Two',
        },
      ];
      const contents = [];

      Logger.debug = jest.fn();
      notionApiService.getPagesMetadata = jest
        .fn()
        .mockReturnValue(notionBlocks);
      contentService.getContent = jest.fn().mockReturnValue(contents);
      eventBus.publish = jest.fn();

      await processor.syncNotionJob();

      expect(eventBus.publish).toBeCalledWith(
        new NotionPageCreatedEvent(notionBlocks[0]),
      );
    });

    it(`handles page deletion for pages that are in DB but not in Notion anymore`, async () => {
      const notionBlocks = [];
      const contents: Content[] = [
        {
          id: 1,
          blockID: '9dd90a4c-58bc-436d-8a7f-adca881c3215',
          lastEditedAt: new Date('2021-11-07T14:51:00.000Z'),
          type: 'lesson',
          title: 'Title One',
          blocks: '[...]',
        },
      ];

      Logger.debug = jest.fn();
      notionApiService.getPagesMetadata = jest
        .fn()
        .mockReturnValue(notionBlocks);
      contentService.getContent = jest.fn().mockReturnValue(contents);
      blocksQueue.add = jest.fn();

      await processor.syncNotionJob();

      expect(eventBus.publish).toBeCalledWith(
        new NotionPageDeletedEvent(contents[0]),
      );
    });

    it(`handles page updation for pages that have been updated in Notion recently`, async () => {
      const notionBlocks = [
        {
          id: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
          lastEditedAt: '2021-11-08T20:14:00.000Z',
          type: 'lesson',
          title: 'Title One',
        },
      ];
      const contents = [
        {
          id: 1,
          blockID: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
          isUpdating: false,
          lastEditedAt: new Date('2021-11-02T03:02:55.000Z'),
          type: 'lesson',
          title: 'Title One',
          blocks: '[...]',
        },
      ];

      Logger.debug = jest.fn();
      notionApiService.getPagesMetadata = jest
        .fn()
        .mockReturnValue(notionBlocks);
      contentService.getContent = jest.fn().mockReturnValue(contents);
      apiQueue.add = jest.fn();
      eventBus.publish = jest.fn();

      await processor.syncNotionJob();

      expect(eventBus.publish).toBeCalledWith(
        new NotionPageUpdatedEvent(contents[0], notionBlocks[0]),
      );
    });
  });

  describe('fetchNotionBlockJob', () => {
    it(`fetches block metadata & children, and updates the 'notion_block' table`, async () => {
      const job = { data: { blockID: 'block ID' } } as any;

      notionApiService.getBlockMetadata = jest.fn().mockReturnValue({
        last_edited_time: '2021-11-11 20:56:00',
      });
      notionApiService.getChildrenBlocks = jest.fn().mockReturnValue({
        childrenBlocks: 'children blocks',
        parentBlocks: [],
      });
      blocksQueue.add = jest.fn();
      apiQueue.add = jest.fn();

      await processor.fetchNotionBlockJob(job);

      expect(notionApiService.getBlockMetadata).toBeCalledWith('block ID');
      expect(notionApiService.getChildrenBlocks).toHaveBeenCalledWith(
        'block ID',
      );
      expect(blocksQueue.add).toBeCalledWith(JOBS.UPDATE_NOTION_BLOCK, {
        blockID: 'block ID',
        lastEditedAt: '2021-11-11 20:56:00',
        isUpdating: true,
        childrenBlocks: [],
      });
      expect(apiQueue.add).not.toBeCalled();
      expect(blocksQueue.add).toBeCalledWith(JOBS.UPDATE_NOTION_BLOCK, {
        blockID: 'block ID',
        lastEditedAt: '2021-11-11 20:56:00',
        isUpdating: false,
        childrenBlocks: 'children blocks',
      });
    });

    it(`enqueues checkBlockFetchStatusJob if block is not a child`, async () => {
      const job = { data: { blockID: 'block ID', isChild: false } } as any;

      notionApiService.getBlockMetadata = jest.fn().mockReturnValue({
        last_edited_time: '2021-11-11 20:56:00',
      });
      notionApiService.getChildrenBlocks = jest.fn().mockReturnValue({
        childrenBlocks: 'children blocks',
        parentBlocks: [],
      });
      blocksQueue.add = jest.fn();
      apiQueue.add = jest.fn();

      await processor.fetchNotionBlockJob(job);

      expect(blocksQueue.add).toBeCalledWith(
        JOBS.CHECK_BLOCK_FETCH_STATUS,
        {
          blockID: 'block ID',
        },
        {
          ...JOBS.OPTIONS.RETRIED,
          ...JOBS.OPTIONS.DELAYED,
        },
      );
    });

    it(`enqueues separate fetchNotionBlock jobs for children blocks`, async () => {
      const job = { data: { blockID: 'block ID' } } as any;

      notionApiService.getBlockMetadata = jest.fn().mockReturnValue({
        last_edited_time: '2021-11-11 20:56:00',
      });
      notionApiService.getChildrenBlocks = jest.fn().mockReturnValue({
        childrenBlocks: 'children blocks',
        parentBlocks: ['parent block 1', 'parent block 2'],
      });
      blocksQueue.add = jest.fn();
      apiQueue.add = jest.fn();

      await processor.fetchNotionBlockJob(job);

      expect(apiQueue.add).toBeCalledWith(JOBS.FETCH_NOTION_BLOCK, {
        blockID: 'parent block 1',
        isChild: true,
      });
      expect(apiQueue.add).toBeCalledWith(JOBS.FETCH_NOTION_BLOCK, {
        blockID: 'parent block 2',
        isChild: true,
      });
    });

    it(`throws error & fails job if any error is caught`, async () => {
      const job = { data: { blockID: 'block ID' } } as any;
      notionApiService.getBlockMetadata = jest.fn(async () => {
        throw new Error('Notion API error');
      });

      expect(processor.fetchNotionBlockJob(job)).rejects.toThrowError(
        `Notion API error`,
      );
    });
  });
});
