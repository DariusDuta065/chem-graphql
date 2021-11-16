import { Repository } from 'typeorm';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../user/user.entity';
import { Content } from './content.entity';
import { Role } from '../auth/enums/role.enum';
import { isBlock, NotionBlockType } from '../notion/types';
import { NotionBlock } from '../notion/notion-block.entity';
import { Group } from 'src/group/group.entity';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content) private contentRepository: Repository<Content>,
    @InjectRepository(NotionBlock)
    private blocksRepository: Repository<NotionBlock>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Based on the `userID` user, retrieves the content their `group`
   * has access to and returns it.
   *
   * @param userID
   * @returns {Promise<Content[]>}
   * @throws {UnauthorizedException}
   */
  public async getContentsForUser(userID: number): Promise<Content[]> {
    const user = await this.getUser(userID);

    if (user.role === Role.Admin) {
      return this.contentRepository.find();
    }

    return this.getGroupContents(user.group);
  }

  /**
   * Retrieves list of all contents `userID` has access to
   * via getContentsForUser(), then finds specific
   * `contentID` in that Content[] and returns it.
   *
   * @param userID
   * @param contentID
   * @returns {Promise<Content | undefined}
   * @throws {UnauthorizedException}
   */
  public async getContentForUser(
    userID: number,
    contentID: number,
  ): Promise<Content | undefined> {
    return (await this.getContentsForUser(userID)).filter(
      (c) => c.id === contentID,
    )[0];
  }

  public async getContent(): Promise<Content[]> {
    return this.contentRepository.find();
  }

  public async getContentByBlockID(blockID: string): Promise<Content> {
    return this.contentRepository.findOneOrFail({ blockID });
  }

  public async insertContent(content: Content): Promise<Content> {
    return this.contentRepository.save(content);
  }

  public async updateContent(content: Content): Promise<Content> {
    return this.contentRepository.save(content);
  }

  public async deleteContent(blockID: string): Promise<boolean> {
    const content = await this.contentRepository.findOne({ blockID });

    if (!content) {
      return false;
    }

    content.groups = Promise.resolve([]);
    await this.contentRepository.save(content);

    await this.contentRepository.delete({ blockID });
    return true;
  }

  public async aggregateContentBlocks(blockID: string): Promise<void> {
    const content = await this.getContentByBlockID(blockID);
    content.blocks = await this.getChildrenBlocks(blockID);

    await this.updateContent(content);
  }

  public async getChildrenBlocks(blockID: string): Promise<string> {
    const { childrenBlocks } = await this.blocksRepository.findOneOrFail({
      blockID,
    });

    const parsedBlocks: NotionBlockType[] = JSON.parse(childrenBlocks);

    for (const block of parsedBlocks) {
      if (isBlock(block) && block.has_children) {
        block.children = JSON.parse(await this.getChildrenBlocks(block.id));
      }
    }

    return JSON.stringify(parsedBlocks);
  }

  private async getUser(userID: number): Promise<User> {
    const user = await this.userRepository.findOne(userID, {
      loadEagerRelations: true,
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  private async getGroupContents(
    groupPromise: Promise<Group> | undefined,
  ): Promise<Content[]> {
    const group = await groupPromise;
    if (!group || !group.contents) {
      return [];
    }
    return group.contents;
  }
}
