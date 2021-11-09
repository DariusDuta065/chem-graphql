import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { NotionQueriesProcessor } from '.';
import { NotionAPIService, NotionBlockService } from '../services';
import { Logger } from '@nestjs/common';
import {
  PageCreatedEvent,
  PageDeletedEvent,
  PageUpdatedEvent,
} from '../events';

describe('NotionQueriesProcessor', () => {
  let eventEmitter: EventEmitter2;
  let notionApiService: NotionAPIService;
  let notionBlockService: NotionBlockService;
  let notionQueriesProcessor: NotionQueriesProcessor;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotionQueriesProcessor,
        {
          provide: NotionAPIService,
          useValue: {},
        },
        {
          provide: EventEmitter2,
          useValue: {},
        },
        {
          provide: NotionBlockService,
          useValue: {},
        },
      ],
    }).compile();

    notionQueriesProcessor = module.get<NotionQueriesProcessor>(
      NotionQueriesProcessor,
    );

    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    notionApiService = module.get<NotionAPIService>(NotionAPIService);
    notionBlockService = module.get<NotionBlockService>(NotionBlockService);
  });

  it(`is defined`, async () => {
    expect(notionQueriesProcessor).toBeDefined();
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
      const dbBlocks = [
        {
          blockID: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
          isUpdating: false,
          lastEditedAt: new Date('2021-11-02T03:02:55.000Z'),
          childrenBlocks: '[...]',
        },
        {
          blockID: '1336e560-26ba-44c0-b7d0-59d058cab8fa',
          isUpdating: false,
          lastEditedAt: new Date('2021-11-08T03:04:10.000Z'),
          childrenBlocks: '[...]',
        },
      ];

      Logger.debug = jest.fn();
      eventEmitter.emitAsync = jest.fn();
      const getBlocksDifferencesSpy = jest.spyOn(
        NotionBlockService,
        'getBlocksDifferences',
      );
      notionApiService.getPagesMetadata = jest
        .fn()
        .mockReturnValue(notionBlocks);
      notionBlockService.getBlocks = jest.fn().mockReturnValue(dbBlocks);

      await notionQueriesProcessor.syncNotionJob();

      expect(notionApiService.getPagesMetadata).toBeCalled();
      expect(notionBlockService.getBlocks).toBeCalled();
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
      const mockError = jest.fn();
      jest.spyOn(Logger.prototype, 'error').mockImplementation(mockError);

      notionApiService.getPagesMetadata = jest.fn(() => {
        throw new Error('Notion API error');
      });
      notionBlockService.getBlocks = jest.fn().mockReturnValue([]);

      await notionQueriesProcessor.syncNotionJob();

      expect(notionApiService.getPagesMetadata).toBeCalled();
      expect(mockError).toBeCalledWith(
        'Error in sync_notion Error: Notion API error',
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
      const dbBlocks = [
        {
          blockID: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
          isUpdating: false,
          lastEditedAt: new Date('2021-11-02T03:02:55.000Z'),
          childrenBlocks: '[...]',
        },
        {
          blockID: '1336e560-26ba-44c0-b7d0-59d058cab8fa',
          isUpdating: false,
          lastEditedAt: new Date('2021-11-08T03:04:10.000Z'),
          childrenBlocks: '[...]',
        },
      ];

      const mockWarn = jest.fn();
      jest.spyOn(Logger.prototype, 'warn').mockImplementation(mockWarn);
      notionApiService.getPagesMetadata = jest
        .fn()
        .mockReturnValue(notionBlocks);
      notionBlockService.getBlocks = jest.fn().mockReturnValue(dbBlocks);

      jest
        .spyOn(Array.prototype as any, 'find')
        .mockImplementationOnce(() => undefined)
        .mockImplementationOnce(() => undefined)
        .mockImplementationOnce(() => undefined);

      await notionQueriesProcessor.syncNotionJob();

      expect(notionApiService.getPagesMetadata).toBeCalled();
      expect(notionBlockService.getBlocks).toBeCalled();

      [
        '9dd90a4c-58bc-436d-8a7f-adca881c3215',
        '1336e560-26ba-44c0-b7d0-59d058cab8fa',
        '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
      ].forEach((id) => {
        expect(mockWarn).toBeCalledWith(`Notion block ${id} not found`);
      });
    });

    it(`emits 'page.created' for pages that are in Notion but not in DB`, async () => {
      const notionBlocks = [
        {
          id: '9dd90a4c-58bc-436d-8a7f-adca881c3215',
          lastEditedAt: '2021-11-07T14:51:00.000Z',
          type: 'exercise',
          title: 'Title Two',
        },
      ];
      const dbBlocks = [];

      Logger.debug = jest.fn();
      eventEmitter.emitAsync = jest.fn();
      notionApiService.getPagesMetadata = jest
        .fn()
        .mockReturnValue(notionBlocks);
      notionBlockService.getBlocks = jest.fn().mockReturnValue(dbBlocks);

      await notionQueriesProcessor.syncNotionJob();

      const event = new PageCreatedEvent();
      event.blockID = '9dd90a4c-58bc-436d-8a7f-adca881c3215';
      event.lastEditedAt = '2021-11-07T14:51:00.000Z';
      event.type = 'exercise';
      event.title = 'Title Two';

      expect(eventEmitter.emitAsync).toBeCalledWith('page.created', event);
    });

    it(`emits 'page.deleted' for pages that are in DB but not in Notion anymore`, async () => {
      const notionBlocks = [];
      const dbBlocks = [
        {
          blockID: '9dd90a4c-58bc-436d-8a7f-adca881c3215',
          lastEditedAt: new Date('2021-11-07T14:51:00.000Z'),
          isUpdating: false,
          childrenBlocks: '[...]',
        },
      ];

      Logger.debug = jest.fn();
      eventEmitter.emitAsync = jest.fn();
      notionApiService.getPagesMetadata = jest
        .fn()
        .mockReturnValue(notionBlocks);
      notionBlockService.getBlocks = jest.fn().mockReturnValue(dbBlocks);

      await notionQueriesProcessor.syncNotionJob();

      const event = new PageDeletedEvent();
      event.blockID = '9dd90a4c-58bc-436d-8a7f-adca881c3215';

      expect(eventEmitter.emitAsync).toBeCalledWith('page.deleted', event);
    });

    it(`emits 'page.updated' for pages that have been updated in Notion recently`, async () => {
      const notionBlocks = [
        {
          id: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
          lastEditedAt: '2021-11-08T20:14:00.000Z',
          type: 'lesson',
          title: 'Title One',
        },
      ];
      const dbBlocks = [
        {
          blockID: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
          isUpdating: false,
          lastEditedAt: new Date('2021-11-02T03:02:55.000Z'),
          childrenBlocks: '[...]',
        },
      ];

      Logger.debug = jest.fn();
      eventEmitter.emitAsync = jest.fn();
      notionApiService.getPagesMetadata = jest
        .fn()
        .mockReturnValue(notionBlocks);
      notionBlockService.getBlocks = jest.fn().mockReturnValue(dbBlocks);

      await notionQueriesProcessor.syncNotionJob();

      const event = new PageUpdatedEvent();
      event.blockID = '0c73cdcb-ad0c-4f47-842d-bde407cbb81e';
      event.lastEditedAt = '2021-11-08T20:14:00.000Z';
      event.title = 'Title One';
      event.type = 'lesson';

      expect(eventEmitter.emitAsync).toBeCalledWith('page.updated', event);
    });
  });
});
