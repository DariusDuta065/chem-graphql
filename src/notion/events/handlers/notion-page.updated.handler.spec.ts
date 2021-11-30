import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';

import { QUEUES } from 'src/shared/queues';
import { NotionPageUpdatedEvent } from '..';
import { Content } from 'src/content/content.entity';
import {
  ChannelName,
  CheckBlockFetchStatusJob,
  FetchNotionBlockJob,
  JOBS,
  SendDiscordMessageJob,
  UpdateContentJob,
} from 'src/shared/jobs';
import { NotionPageUpdatedHandler } from './notion-page-updated.handler';
import { NotionPage } from 'src/notion/types';

describe('NotionPageUpdatedHandler', () => {
  let handler: NotionPageUpdatedHandler;

  let apiQueue: Queue;
  let blocksQueue: Queue;
  let contentQueue: Queue;
  let discordQueue: Queue;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotionPageUpdatedHandler,
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

    handler = module.get<NotionPageUpdatedHandler>(NotionPageUpdatedHandler);

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

  it(`enqueues UpdateContentJob`, async () => {
    const content: Content = {
      id: 1,
      blockID: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
      lastEditedAt: new Date('2021-11-02T03:02:55.000Z'),
      type: 'lesson',
      title: 'Title One',
      blocks: '[...]',
    };
    const notionBlock: NotionPage = {
      id: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
      lastEditedAt: '2021-11-07T14:51:00.000Z',
      type: 'exercise',
      title: 'Title Two',
    };
    const event = new NotionPageUpdatedEvent(content, notionBlock);

    await handler.handle(event);

    const updateContentJob: UpdateContentJob = {
      id: 1,
      blockID: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
      lastEditedAt: '2021-11-07T14:51:00.000Z',
      type: 'exercise',
      title: 'Title Two',
      blocks: '[...]',
    };
    expect(contentQueue.add).toBeCalledWith(
      JOBS.UPDATE_CONTENT,
      updateContentJob,
    );
  });

  it(`enqueues FetchNotionBlockJob`, async () => {
    const content: Content = {
      id: 1,
      blockID: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
      lastEditedAt: new Date('2021-11-02T03:02:55.000Z'),
      type: 'lesson',
      title: 'Title One',
      blocks: '[...]',
    };
    const notionBlock: NotionPage = {
      id: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
      lastEditedAt: '2021-11-07T14:51:00.000Z',
      type: 'exercise',
      title: 'Title Two',
    };
    const event = new NotionPageUpdatedEvent(content, notionBlock);

    await handler.handle(event);

    const fetchNotionBlockJob: FetchNotionBlockJob = {
      blockID: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
    };
    expect(apiQueue.add).toBeCalledWith(
      JOBS.FETCH_NOTION_BLOCK,
      fetchNotionBlockJob,
      JOBS.OPTIONS.RETRIED,
    );
  });

  it(`enqueues CheckBlockFetchStatusJob`, async () => {
    const content: Content = {
      id: 1,
      blockID: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
      lastEditedAt: new Date('2021-11-02T03:02:55.000Z'),
      type: 'lesson',
      title: 'Title One',
      blocks: '[...]',
    };
    const notionBlock: NotionPage = {
      id: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
      lastEditedAt: '2021-11-07T14:51:00.000Z',
      type: 'exercise',
      title: 'Title Two',
    };
    const event = new NotionPageUpdatedEvent(content, notionBlock);

    await handler.handle(event);

    const checkBlockFetchStatusJob: CheckBlockFetchStatusJob = {
      blockID: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
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
    const content: Content = {
      id: 1,
      blockID: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
      lastEditedAt: new Date('2021-11-02T03:02:55.000Z'),
      type: 'lesson',
      title: 'Title One',
      blocks: '[...]',
    };
    const notionBlock: NotionPage = {
      id: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
      lastEditedAt: '2021-11-07T14:51:00.000Z',
      type: 'exercise',
      title: 'Title Two',
    };
    const event = new NotionPageUpdatedEvent(content, notionBlock);

    await handler.handle(event);

    const sendDiscordMessageJob: SendDiscordMessageJob = {
      channel: ChannelName.logging,
      message: `**notion page updated** - ${event.content.title}`,
    };
    expect(discordQueue.add).toBeCalledWith(
      JOBS.SEND_DISCORD_MESSAGE,
      sendDiscordMessageJob,
      JOBS.OPTIONS.RETRIED,
    );
  });
});
