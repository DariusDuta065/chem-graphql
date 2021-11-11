import { Queue } from 'bull';

import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';

import { NotionBlockProcessor } from '.';
import { NotionBlockService } from '../services';
import { ContentService } from '../../content/content.service';

import { QUEUES } from '../../shared/queues';
import { JOBS } from '../../shared/jobs';

describe('NotionBlockProcessor', () => {
  let processor: NotionBlockProcessor;
  let notionBlockService: NotionBlockService;
  let contentQueue: Queue;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotionBlockProcessor,
        {
          provide: ContentService,
          useValue: {},
        },
        {
          provide: NotionBlockService,
          useValue: {},
        },
        {
          provide: getQueueToken(QUEUES.CONTENT),
          useValue: {},
        },
      ],
    }).compile();

    processor = module.get<NotionBlockProcessor>(NotionBlockProcessor);
    notionBlockService = module.get<NotionBlockService>(NotionBlockService);
    contentQueue = module.get<Queue>(getQueueToken(QUEUES.CONTENT));
  });

  it(`is defined`, async () => {
    expect(processor).toBeDefined();
  });

  describe('updateNotionBlockJob', () => {
    it(`persists a notion block`, async () => {
      const job = {
        data: {
          blockID: 'block ID',
          isUpdating: true,
          lastEditedAt: '2021-11-10 19:11:00',
          childrenBlocks: [],
        },
      } as any;
      notionBlockService.upsertBlock = jest.fn();

      await processor.updateNotionBlockJob(job);

      expect(notionBlockService.upsertBlock).toBeCalledWith({
        ...job.data,
        lastEditedAt: new Date('2021-11-10 19:11:00'),
        childrenBlocks: JSON.stringify([]),
      });
    });
  });

  describe('checkFetchStatusJob', () => {
    it(`fails job if not all the page's blocks are in 'notion_block'`, async () => {
      notionBlockService.checkBlockStatus = jest.fn(async () => {
        throw new Error(`any error`);
      });
      const job = {
        data: {
          blockID: 'block ID',
        },
      } as any;

      // In this case, the job will fail (any error thrown fails a job);
      // however, the job will be automatically retried with the
      // exponential backoff strategy, delays, and attempts configured.

      expect(processor.checkFetchStatusJob(job)).rejects.toThrowError(
        'Not all children blocks were fetched yet.',
      );
    });

    it(`queues up AggregateContentBlocksJob`, async () => {
      const job = {
        data: {
          blockID: 'block ID',
        },
      } as any;

      // all blocks & their children that make up this page are
      // present in the 'notion_block' & are not updating
      notionBlockService.checkBlockStatus = jest.fn(async () => {
        return true;
      });
      contentQueue.add = jest.fn();

      await processor.checkFetchStatusJob(job);

      expect(contentQueue.add).toBeCalledWith(JOBS.AGGREGATE_CONTENT_BLOCKS, {
        blockID: 'block ID',
      });
    });
  });
});
