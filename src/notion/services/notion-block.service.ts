import * as _ from 'lodash';
import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { NotionBlock } from '../notion-block.entity';

@Injectable()
export class NotionBlockService {
  //

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
    return true;
  }

  public async aggregateBlocks(startingBlockID: string): Promise<string> {
    return 'aggregate';
  }

  public getBlocks(): Promise<NotionBlock[]> {
    return this.blocksRepository.find();
  }

  public upsertBlock(block: NotionBlock): Promise<NotionBlock> {
    return this.blocksRepository.save(block);
  }
}
