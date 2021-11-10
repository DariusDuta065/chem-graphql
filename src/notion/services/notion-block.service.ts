import * as _ from 'lodash';
import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { NotionBlock } from '../notion-block.entity';
import { isBlock, NotionBlockType } from '../types';

@Injectable()
export class NotionBlockService {
  constructor(
    @InjectRepository(NotionBlock)
    private blocksRepository: Repository<NotionBlock>,
  ) {}

  public static getBlocksDifferences(
    notionBlocksIDs: string[],
    dbBlocksIDs: string[],
  ): { common: string[]; notInDB: string[]; notInNotion: string[] } {
    return {
      common: _.intersection(notionBlocksIDs, dbBlocksIDs),
      notInDB: _.difference(notionBlocksIDs, dbBlocksIDs),
      notInNotion: _.difference(dbBlocksIDs, notionBlocksIDs),
    };
  }

  public async checkBlockStatus(blockID: string): Promise<boolean> {
    const { childrenBlocks, isUpdating } =
      await this.blocksRepository.findOneOrFail({
        blockID,
      });

    if (isUpdating) {
      throw new Error(`Block ${blockID} is still updating`);
    }

    const parsedBlocks: NotionBlockType[] = JSON.parse(childrenBlocks);

    for (const block of parsedBlocks) {
      if (isBlock(block) && block.has_children) {
        await this.checkBlockStatus(block.id);
      }
    }

    return true;
  }

  public getBlocks(): Promise<NotionBlock[]> {
    return this.blocksRepository.find();
  }

  public upsertBlock(block: NotionBlock): Promise<NotionBlock> {
    return this.blocksRepository.save(block);
  }
}
