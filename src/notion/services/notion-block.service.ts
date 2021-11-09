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

  /**
   * Returns all rows from the `notion_blocks` table.
   *
   * @returns {Promise<NotionBlock[]>}
   */
  public async getBlocks(): Promise<NotionBlock[]> {
    return this.blocksRepository.find();
  }

  public static getBlocksDifferences(
    notionBlocksIDs: string[],
    dbBlocksIDs: string[],
  ) {
    return {
      common: _.intersection(notionBlocksIDs, dbBlocksIDs),
      notInDB: _.difference(notionBlocksIDs, dbBlocksIDs),
      notInNotion: _.difference(dbBlocksIDs, notionBlocksIDs),
    };
  }
}
