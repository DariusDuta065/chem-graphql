import { Test, TestingModule } from '@nestjs/testing';

import { ContentService } from '../content/content.service';
import { ContentProcessor } from './content.processor';

describe('ContentProcessor', () => {
  let processor: ContentProcessor;
  let contentService: ContentService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentProcessor,
        {
          provide: ContentService,
          useValue: {},
        },
      ],
    }).compile();

    processor = module.get<ContentProcessor>(ContentProcessor);
    contentService = module.get<ContentService>(ContentService);
  });

  it(`is defined`, async () => {
    expect(processor).toBeDefined();
  });

  describe('createContentJob', () => {
    it(`creates content`, async () => {
      const job = {
        data: {
          blockID: 'block ID',
          title: 'title',
          type: 'type',
          lastEditedAt: '2021-11-11 02:21:00',
        },
      } as any;
      contentService.insertContent = jest.fn();

      await processor.createContentJob(job);

      expect(contentService.insertContent).toBeCalledWith({
        ...job.data,
        lastEditedAt: new Date(job.data.lastEditedAt),
        blocks: '',
      });
    });
  });

  describe('updateContentJob', () => {
    it(`updates content`, async () => {
      const job = {
        data: {
          id: 1,
          blockID: 'block ID',
          title: 'title',
          type: 'type',
          blocks: '[...]',
          lastEditedAt: '2021-11-11 02:21:00',
        },
      } as any;
      contentService.updateContent = jest.fn();

      await processor.updateContentJob(job);

      expect(contentService.updateContent).toBeCalledWith({
        id: job.data.id,
        blockID: job.data.blockID,
        title: job.data.title,
        type: job.data.type,
        blocks: job.data.blocks,
        lastEditedAt: new Date(job.data.lastEditedAt),
      });
    });
  });

  describe('deleteContentJob', () => {
    it(`deletes content via blockID`, async () => {
      contentService.deleteContent = jest.fn();

      await processor.deleteContentJob({
        data: { blockID: 'block ID' },
      } as any);

      expect(contentService.deleteContent).toBeCalledWith('block ID');
    });
  });

  describe('aggregateContentBlocksJob', () => {
    it(`aggregates children blocks to compose the whole page`, async () => {
      contentService.aggregateContentBlocks = jest.fn();

      await processor.aggregateContentBlocksJob({
        data: {
          blockID: 'blockID',
        },
      } as any);

      expect(contentService.aggregateContentBlocks).toBeCalledWith('blockID');
    });
  });
});
