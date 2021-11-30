import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';

import {
  ChannelName,
  DeleteContentJob,
  JOBS,
  SendDiscordMessageJob,
} from 'src/shared/jobs';
import { QUEUES } from 'src/shared/queues';
import { NotionPageDeletedEvent } from '..';
import { Content } from 'src/content/content.entity';
import { NotionPageDeletedHandler } from './notion-page-deleted.handler';

describe('NotionPageDeletedHandler', () => {
  let handler: NotionPageDeletedHandler;

  let contentQueue: Queue;
  let discordQueue: Queue;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotionPageDeletedHandler,
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

    handler = module.get<NotionPageDeletedHandler>(NotionPageDeletedHandler);

    contentQueue = module.get<Queue>(getQueueToken(QUEUES.CONTENT));
    discordQueue = module.get<Queue>(getQueueToken(QUEUES.DISCORD));
  });

  beforeEach(async () => {
    contentQueue.add = jest.fn();
    discordQueue.add = jest.fn();
  });

  it(`is defined`, async () => {
    expect(handler).toBeDefined();
  });

  it(`enqueues DeleteContentJob`, async () => {
    const content: Content = {
      id: 1,
      blockID: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
      lastEditedAt: new Date('2021-11-02T03:02:55.000Z'),
      type: 'lesson',
      title: 'Title One',
      blocks: '[...]',
    };
    const event = new NotionPageDeletedEvent(content);

    await handler.handle(event);

    const deleteContentJob: DeleteContentJob = {
      blockID: '0c73cdcb-ad0c-4f47-842d-bde407cbb81e',
    };
    expect(contentQueue.add).toBeCalledWith(
      JOBS.DELETE_CONTENT,
      deleteContentJob,
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
    const event = new NotionPageDeletedEvent(content);

    await handler.handle(event);

    const sendDiscordMessageJob: SendDiscordMessageJob = {
      channel: ChannelName.logging,
      message: `**notion page deleted** - ${event.content.title}`,
    };
    expect(discordQueue.add).toBeCalledWith(
      JOBS.SEND_DISCORD_MESSAGE,
      sendDiscordMessageJob,
      JOBS.OPTIONS.RETRIED,
    );
  });
});
