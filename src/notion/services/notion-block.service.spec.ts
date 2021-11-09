import { Repository } from 'typeorm';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { NotionBlock } from '../notion-block.entity';
import { NotionBlockService } from './notion-block.service';

describe(`NotionBlockService`, () => {
  let module: TestingModule;
  let notionBlockService: NotionBlockService;
  let blocksRepository: Repository<NotionBlock>;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        NotionBlockService,
        {
          provide: getRepositoryToken(NotionBlock),
          useValue: {},
        },
      ],
    }).compile();

    notionBlockService = module.get<NotionBlockService>(NotionBlockService);
    blocksRepository = module.get<Repository<NotionBlock>>(
      getRepositoryToken(NotionBlock),
    );
  });

  afterAll(async () => {
    await module.close();
  });

  it(`is defined`, () => {
    expect(notionBlockService).toBeDefined();
  });

  describe('getBlocksFromDB', () => {
    it(`fetch all rows from the 'notion_blocks' table`, async () => {
      blocksRepository.find = jest.fn();

      await notionBlockService.getBlocks();

      expect(blocksRepository.find).toBeCalled();
    });
  });
});
