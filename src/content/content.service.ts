import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from './content.entity';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content) private contentRepository: Repository<Content>,
  ) {}

  public getContent(): Promise<Content[]> {
    return this.contentRepository.find();
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
    console.log('aggregate blocks for page ID:', blockID);

    const content = await this.contentRepository.findOne({ blockID });

    if (!content) {
      console.log('content not found');
      return;
    }

    content.blocks = 'blocks will be here';

    this.contentRepository.save(content);
  }
}
