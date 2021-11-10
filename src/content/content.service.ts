import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Content } from './content.entity';
import { NotionBlock } from '../notion/notion-block.entity';
import { isBlock, NotionBlockType } from '../notion/types';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content) private contentRepository: Repository<Content>,
    @InjectRepository(NotionBlock)
    private blocksRepository: Repository<NotionBlock>,
  ) {}

  public getContent(): Promise<Content[]> {
    return this.contentRepository.find();
  }

  public getContentByBlockID(blockID: string): Promise<Content> {
    return this.contentRepository.findOneOrFail({ blockID });
  }

  public insertContent(content: Content): Promise<Content> {
    return this.contentRepository.save(content);
  }

  public updateContent(content: Content): Promise<Content> {
    return this.contentRepository.save(content);
  }

  public deleteContent(blockID: string): void {
    this.contentRepository.delete({ blockID });
  }

  public async aggregateContentBlocks(blockID: string): Promise<void> {
    const content = await this.getContentByBlockID(blockID);

    const getChildrenBlocks = async (blockID: string): Promise<string> => {
      const { childrenBlocks } = await this.blocksRepository.findOneOrFail({
        blockID,
      });

      const parsedBlocks: NotionBlockType[] = JSON.parse(childrenBlocks);

      for (const block of parsedBlocks) {
        if (isBlock(block) && block.has_children) {
          block.children = JSON.parse(await getChildrenBlocks(block.id));
        }
      }

      return JSON.stringify(parsedBlocks);
    };

    content.blocks = await getChildrenBlocks(blockID);
    await this.updateContent(content);
  }
}
