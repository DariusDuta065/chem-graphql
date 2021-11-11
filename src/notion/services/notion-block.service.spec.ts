import * as _ from 'lodash';
import { Repository } from 'typeorm';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { NotionBlock } from '../notion-block.entity';
import { NotionBlockService } from './notion-block.service';

describe(`NotionBlockService`, () => {
  let module: TestingModule;
  let service: NotionBlockService;
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

    service = module.get<NotionBlockService>(NotionBlockService);
    blocksRepository = module.get<Repository<NotionBlock>>(
      getRepositoryToken(NotionBlock),
    );
  });

  afterAll(async () => {
    await module.close();
  });

  it(`is defined`, () => {
    expect(service).toBeDefined();
  });

  describe('getBlocksDifferences', () => {
    it(`determines blocks to be updated`, () => {
      const intersectionSpy = jest.spyOn(_, 'intersection');

      const res = NotionBlockService.getBlocksDifferences(
        ['1', '2'],
        ['2', '3'],
      );

      /**
       * These blocks are found in both Notion's API and the
       * 'notion_block' table; they will be checked for any updates.
       */

      expect(intersectionSpy).toBeCalled();
      expect(res.common).toStrictEqual(['2']);
    });

    it(`determines blocks to be inserted`, () => {
      const differenceSpy = jest.spyOn(_, 'difference');

      const res = NotionBlockService.getBlocksDifferences(
        ['1', '2'],
        ['2', '3'],
      );

      /**
       * Blocks that were returned by Notion's API but are not in
       * the 'notion_block' table will be added to the table.
       */

      expect(differenceSpy).toBeCalled();
      expect(res.notInDB).toStrictEqual(['1']);
    });

    it(`determines blocks to be deleted`, () => {
      const differenceSpy = jest.spyOn(_, 'difference');

      const res = NotionBlockService.getBlocksDifferences(
        ['1', '2'],
        ['2', '3'],
      );

      /**
       * Blocks that are 'not in Notion' but are in the
       * 'notion_block' table will be deleted.
       */

      expect(differenceSpy).toBeCalled();
      expect(res.notInNotion).toStrictEqual(['3']);
    });
  });

  describe('checkBlockStatus', () => {
    it(`returns true if all blocks are found & not updating`, async () => {
      const block = {
        blockID: 'e25e0253-9574-4618-a234-30c8c3233463',
        lastEditedAt: '2021-11-11 14:19:00',
        isUpdating: false,
        childrenBlocks: JSON.stringify([
          {
            object: 'block',
            id: '3dbb1639-0e02-460a-a6ed-034d95b6978c',
            created_time: '2021-11-11T14:17:00.000Z',
            last_edited_time: '2021-11-11T14:17:00.000Z',
            has_children: false,
            archived: false,
            type: 'paragraph',
            paragraph: {},
          },
        ]),
      };

      blocksRepository.findOneOrFail = jest.fn().mockReturnValue(block);

      const res = await service.checkBlockStatus(
        'e25e0253-9574-4618-a234-30c8c3233463',
      );

      expect(res).toBeTruthy();
    });

    it(`throws error if a block is not found`, async () => {
      blocksRepository.findOneOrFail = jest
        .fn()
        .mockRejectedValue(new Error('typeorm entity not found'));

      expect(service.checkBlockStatus('e25e0253-9574')).rejects.toThrowError(
        'typeorm entity not found',
      );
      expect(blocksRepository.findOneOrFail).toBeCalledWith({
        blockID: 'e25e0253-9574',
      });
    });

    it(`throw error if a block is still updating`, async () => {
      const block = {
        blockID: 'e25e0253-9574-4618-a234-30c8c3233463',
        lastEditedAt: '2021-11-11 14:19:00',
        isUpdating: true,
        childrenBlocks: JSON.stringify([
          {
            object: 'block',
            id: '3dbb1639-0e02-460a-a6ed-034d95b6978c',
            created_time: '2021-11-11T14:17:00.000Z',
            last_edited_time: '2021-11-11T14:17:00.000Z',
            has_children: false,
            archived: false,
            type: 'paragraph',
            paragraph: {},
          },
        ]),
      };
      blocksRepository.findOneOrFail = jest.fn().mockReturnValue(block);

      expect(service.checkBlockStatus('e25e0253-9574')).rejects.toThrowError(
        'Block e25e0253-9574 is still updating',
      );
    });

    it(`recursively checks every child block`, async () => {
      const parentBlock = {
        blockID: 'e25e0253-9574-4618-a234-30c8c3233463',
        lastEditedAt: '2021-11-11 14:19:00',
        isUpdating: false,
        childrenBlocks: JSON.stringify([
          {
            object: 'block',
            id: '3dbb1639-0e02-460a-a6ed-034d95b6978c',
            created_time: '2021-11-11T14:17:00.000Z',
            last_edited_time: '2021-11-11T14:17:00.000Z',
            has_children: true,
            archived: false,
            type: 'paragraph',
            paragraph: {},
          },
        ]),
      };
      const childBlock = {
        blockID: '3dbb1639-0e02-460a-a6ed-034d95b6978c',
        lastEditedAt: '2021-11-11 14:17:00',
        isUpdating: false,
        childrenBlocks: JSON.stringify([
          {
            object: 'block',
            id: 'c77d6985-b30c-471e-a8c0-1149c596fa0f',
            created_time: '2021-11-11T14:17:00.000Z',
            last_edited_time: '2021-11-11T14:17:00.000Z',
            has_children: false,
            archived: false,
            type: 'paragraph',
            paragraph: {},
          },
        ]),
      };

      blocksRepository.findOneOrFail = jest
        .fn()
        .mockReturnValueOnce(parentBlock)
        .mockReturnValueOnce(childBlock);

      await service.checkBlockStatus('e25e0253-9574-4618-a234-30c8c3233463');

      expect(blocksRepository.findOneOrFail).toBeCalledWith({
        blockID: 'e25e0253-9574-4618-a234-30c8c3233463',
      });
      expect(blocksRepository.findOneOrFail).toBeCalledWith({
        blockID: '3dbb1639-0e02-460a-a6ed-034d95b6978c',
      });
    });
  });

  describe('getBlocks', () => {
    it(`fetch all rows from the 'notion_blocks' table`, async () => {
      blocksRepository.find = jest.fn();

      await service.getBlocks();

      expect(blocksRepository.find).toBeCalled();
    });
  });

  describe('upsertBlock', () => {
    it(`persists notion block`, async () => {
      const block: NotionBlock = {
        blockID: 'block ID',
        lastEditedAt: new Date(),
        childrenBlocks: '[]',
        isUpdating: false,
      };
      blocksRepository.save = jest.fn();

      await service.upsertBlock(block);

      expect(blocksRepository.save).toBeCalledWith(block);
    });
  });
});
