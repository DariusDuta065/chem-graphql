import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';

import { QUEUES } from 'src/shared/queues';
import { NotionPageDeletedEvent } from '..';
import { Content } from 'src/content/content.entity';
import { DeleteContentJob, JOBS } from 'src/shared/jobs';
import { NotionPageDeletedHandler } from './notion-page-deleted.handler';

describe('NotionPageDeletedHandler', () => {
  let handler: NotionPageDeletedHandler;

  let contentQueue: Queue;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotionPageDeletedHandler,
        {
          provide: getQueueToken(QUEUES.CONTENT),
          useValue: {},
        },
      ],
    }).compile();

    handler = module.get<NotionPageDeletedHandler>(NotionPageDeletedHandler);

    contentQueue = module.get<Queue>(getQueueToken(QUEUES.CONTENT));
  });

  beforeEach(async () => {
    contentQueue.add = jest.fn();
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
});
