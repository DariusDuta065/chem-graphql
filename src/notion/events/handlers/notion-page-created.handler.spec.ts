import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';

import {
  JOBS,
  CreateContentJob,
  FetchNotionBlockJob,
  CheckBlockFetchStatusJob,
  SendDiscordMessageJob,
  ChannelName,
} from 'src/shared/jobs';
import { QUEUES } from 'src/shared/queues';
import { NotionPage } from 'src/notion/types';
import { NotionPageCreatedEvent } from '..';
import { NotionPageCreatedHandler } from './notion-page-created.handler';

describe('NotionPageCreatedHandler', () => {
  let handler: NotionPageCreatedHandler;

  let apiQueue: Queue;
  let blocksQueue: Queue;
  let contentQueue: Queue;
  let discordQueue: Queue;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotionPageCreatedHandler,
        {
          provide: getQueueToken(QUEUES.NOTION_API),
          useValue: {},
        },
        {
          provide: getQueueToken(QUEUES.NOTION_BLOCKS),
          useValue: {},
        },
        {
          provide: getQueueToken(QUEUES.CONTENT),
          useValue: {},
        },
        {
          provide: getQueueToken(QUEUES.DISCORD),
          useValue: {},
        },
      ],
    }).compile();

    handler = module.get<NotionPageCreatedHandler>(NotionPageCreatedHandler);

    apiQueue = module.get<Queue>(getQueueToken(QUEUES.NOTION_API));
    contentQueue = module.get<Queue>(getQueueToken(QUEUES.CONTENT));
    blocksQueue = module.get<Queue>(getQueueToken(QUEUES.NOTION_BLOCKS));
    discordQueue = module.get<Queue>(getQueueToken(QUEUES.DISCORD));
  });

  beforeEach(async () => {
    apiQueue.add = jest.fn();
    contentQueue.add = jest.fn();
    blocksQueue.add = jest.fn();
    discordQueue.add = jest.fn();
  });

  it(`is defined`, async () => {
    expect(handler).toBeDefined();
  });

  it(`enqueues CreateContentJob`, async () => {
    const notionBlock: NotionPage = {
      id: '9dd90a4c-58bc-436d-8a7f-adca881c3215',
      lastEditedAt: '2021-11-07T14:51:00.000Z',
      type: 'exercise',
      title: 'Title Two',
    };
    const event = new NotionPageCreatedEvent(notionBlock);

    await handler.handle(event);

    const createContentJob: CreateContentJob = {
      blockID: '9dd90a4c-58bc-436d-8a7f-adca881c3215',
      lastEditedAt: '2021-11-07T14:51:00.000Z',
      type: 'exercise',
      title: 'Title Two',
    };
    expect(contentQueue.add).toBeCalledWith(
      JOBS.CREATE_CONTENT,
      createContentJob,
    );
  });

  it(`enqueues FetchNotionBlockJob`, async () => {
    const notionBlock: NotionPage = {
      id: '9dd90a4c-58bc-436d-8a7f-adca881c3215',
      lastEditedAt: '2021-11-07T14:51:00.000Z',
      type: 'exercise',
      title: 'Title Two',
    };
    const event = new NotionPageCreatedEvent(notionBlock);

    await handler.handle(event);

    const fetchNotionBlockJob: FetchNotionBlockJob = {
      blockID: '9dd90a4c-58bc-436d-8a7f-adca881c3215',
    };
    expect(apiQueue.add).toBeCalledWith(
      JOBS.FETCH_NOTION_BLOCK,
      fetchNotionBlockJob,
    );
  });

  it(`enqueues CheckBlockFetchStatusJob`, async () => {
    const notionBlock: NotionPage = {
      id: '9dd90a4c-58bc-436d-8a7f-adca881c3215',
      lastEditedAt: '2021-11-07T14:51:00.000Z',
      type: 'exercise',
      title: 'Title Two',
    };
    const event = new NotionPageCreatedEvent(notionBlock);

    await handler.handle(event);

    const checkBlockFetchStatusJob: CheckBlockFetchStatusJob = {
      blockID: '9dd90a4c-58bc-436d-8a7f-adca881c3215',
    };
    expect(blocksQueue.add).toBeCalledWith(
      JOBS.CHECK_BLOCK_FETCH_STATUS,
      checkBlockFetchStatusJob,
      {
        ...JOBS.OPTIONS.RETRIED,
        ...JOBS.OPTIONS.DELAYED,
      },
    );
  });

  it(`enqueues SendDiscordMessageJob `, async () => {
    const notionBlock: NotionPage = {
      id: '9dd90a4c-58bc-436d-8a7f-adca881c3215',
      lastEditedAt: '2021-11-07T14:51:00.000Z',
      type: 'exercise',
      title: 'Title Two',
    };
    const event = new NotionPageCreatedEvent(notionBlock);

    await handler.handle(event);

    const sendDiscordMessageJob: SendDiscordMessageJob = {
      channel: ChannelName.logging,
      message: `**notion page created** - ${event.notionBlock.title}`,
    };
    expect(discordQueue.add).toBeCalledWith(
      JOBS.SEND_DISCORD_MESSAGE,
      sendDiscordMessageJob,
      JOBS.OPTIONS.RETRIED,
    );
  });
});
