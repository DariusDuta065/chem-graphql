import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { User } from '../user/user.entity';
import { Content } from './content.entity';
import { Role } from '../auth/enums/role.enum';
import { NotionBlock } from '../notion/notion-block.entity';

import { ContentService } from './content.service';
import { UnauthorizedException } from '@nestjs/common';
import { Group } from '../group/group.entity';

describe('ContentService', () => {
  let service: ContentService;
  let contentRepository: Repository<Content>;
  let blocksRepository: Repository<NotionBlock>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        {
          provide: getRepositoryToken(Content),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(NotionBlock),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ContentService>(ContentService);
    contentRepository = module.get<Repository<Content>>(
      getRepositoryToken(Content),
    );
    blocksRepository = module.get<Repository<NotionBlock>>(
      getRepositoryToken(NotionBlock),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getContentsForUser', () => {
    it(`returns all content for admins`, async () => {
      const userID = 1;
      const user: User = {
        userId: 1,
        email: 'email@test.com',
        firstName: 'first name',
        lastName: 'last name',
        password: 'hashed password',
        role: Role.Admin,
      };
      userRepository.findOne = jest.fn().mockReturnValue(user);
      contentRepository.find = jest.fn();

      await service.getContentsForUser(userID);

      expect(userRepository.findOne).toBeCalledWith(userID, {
        loadEagerRelations: true,
      });
      expect(contentRepository.find).toBeCalled();
    });

    it(`returns only available content for user's group`, async () => {
      const userID = 1;

      const content: Content = {
        id: 1,
        blockID: '0c73cdcb-ad0b-4f47-842d-bde407cbb81e',
        lastEditedAt: new Date('2021-11-11 20:56:00'),
        title: 'Content 1',
        type: 'lesson',
        blocks: '[...]',
      };
      const group: Group = {
        id: 1,
        grade: 11,
        notes: '',
        scheduleDay: 1,
        scheduleHour: 12,
        scheduleMinute: 30,
        contents: Promise.resolve([content]),
      };
      const user: User = {
        userId: 1,
        email: 'email@test.com',
        firstName: 'first name',
        lastName: 'last name',
        password: 'hashed password',
        role: Role.User,
        group: Promise.resolve(group),
      };
      userRepository.findOne = jest.fn().mockReturnValue(user);

      const res = await service.getContentsForUser(userID);

      expect(res).toStrictEqual([content]);
    });

    it(`throws error if user does not exist`, async () => {
      const userID = 1;
      userRepository.findOne = jest.fn().mockReturnValue(undefined);

      expect(service.getContentsForUser(userID)).rejects.toThrowError(
        UnauthorizedException,
      );
    });

    it(`returns [] if user is not part of a group`, async () => {
      const userID = 1;

      const user: User = {
        userId: 1,
        email: 'email@test.com',
        firstName: 'first name',
        lastName: 'last name',
        password: 'hashed password',
        role: Role.User,
      };
      userRepository.findOne = jest.fn().mockReturnValue(user);

      const res = await service.getContentsForUser(userID);

      expect(res).toStrictEqual([]);
    });
  });

  describe('getContentForUser', () => {
    it(`gets all available content for user, then filters for contentID`, async () => {
      const userID = 1;
      const contentID = 1;

      const content: Content = {
        id: 1,
        blockID: '0c73cdcb-ad0b-4f47-842d-bde407cbb81e',
        lastEditedAt: new Date('2021-11-11 20:56:00'),
        title: 'Content 1',
        type: 'lesson',
        blocks: '[...]',
      };

      service.getContentsForUser = jest.fn(async () => [content]);

      const res = await service.getContentForUser(userID, contentID);

      expect(res).toStrictEqual(content);
    });

    it(`returns undefined if contentID is not available for user`, async () => {
      const userID = 1;
      const contentID = 2;

      const content: Content = {
        id: 1,
        blockID: '0c73cdcb-ad0b-4f47-842d-bde407cbb81e',
        lastEditedAt: new Date('2021-11-11 20:56:00'),
        title: 'Content 1',
        type: 'lesson',
        blocks: '[...]',
      };

      service.getContentsForUser = jest.fn(async () => [content]);

      const res = await service.getContentForUser(userID, contentID);

      expect(res).toBeUndefined();
    });
  });

  describe('getContent', () => {
    it(`returns all content`, async () => {
      contentRepository.find = jest.fn();

      await service.getContent();

      expect(contentRepository.find).toBeCalled();
    });
  });

  describe('getContentByBlockID', () => {
    it(`returns content via its blockID`, async () => {
      contentRepository.findOneOrFail = jest.fn();

      await service.getContentByBlockID('blockID');

      expect(contentRepository.findOneOrFail).toBeCalledWith({
        blockID: 'blockID',
      });
    });
  });

  describe('insertContent', () => {
    it(`persists content`, async () => {
      const content: Content = {
        blockID: 'blockID',
        title: 'title',
        type: 'type',
        lastEditedAt: new Date(),
        blocks: '[...]',
      } as Content;
      contentRepository.save = jest.fn();

      await service.insertContent(content);

      expect(contentRepository.save).toBeCalledWith(content);
    });
  });

  describe('updateContent', () => {
    it(`updates content`, async () => {
      const content: Content = {
        blockID: 'blockID',
        title: 'title',
        type: 'type',
        lastEditedAt: new Date(),
        blocks: '[...]',
      } as Content;
      contentRepository.save = jest.fn();

      await service.updateContent(content);

      expect(contentRepository.save).toBeCalledWith(content);
    });
  });

  describe('deleteContent', () => {
    it(`deletes content when content is found`, async () => {
      const content: Content = {
        id: 1,
        blockID: '0c73cdcb-ad0b-4f47-842d-bde407cbb81e',
        lastEditedAt: new Date('2021-11-11 20:56:00'),
        title: 'content title',
        type: 'content type',
        blocks: '[...]',
      };

      contentRepository.findOne = jest.fn().mockReturnValue(content);
      contentRepository.save = jest.fn();
      contentRepository.delete = jest.fn();

      const res = await service.deleteContent(
        '0c73cdcb-ad0b-4f47-842d-bde407cbb81e',
      );

      expect(res).toBeTruthy();
      expect(contentRepository.save).toBeCalledWith({
        ...content,
        groups: Promise.resolve([]),
      });
      expect(contentRepository.delete).toBeCalledWith({
        blockID: '0c73cdcb-ad0b-4f47-842d-bde407cbb81e',
      });
    });

    it(`returns false if content with blockID doesn't exist`, async () => {
      contentRepository.findOne = jest.fn().mockReturnValue(undefined);
      const res = await service.deleteContent(
        '0c73cdcb-ad0b-4f47-842d-bde407cbb81e',
      );

      expect(res).toBeFalsy();
      expect(contentRepository.findOne).toBeCalledWith({
        blockID: '0c73cdcb-ad0b-4f47-842d-bde407cbb81e',
      });
    });
  });

  describe('aggregateContentBlocks', () => {
    it(`gets all children blocks and attaches them to content entity`, async () => {
      const oldContent: Content = {
        blockID: 'blockID',
        title: 'title',
        type: 'type',
        lastEditedAt: new Date(),
        blocks: 'old blocks',
      } as Content;

      service.getContentByBlockID = jest.fn().mockReturnValue(oldContent);
      service.getChildrenBlocks = jest.fn().mockReturnValue('new blocks');
      service.updateContent = jest.fn();

      await service.aggregateContentBlocks('blockID');

      expect(service.getContentByBlockID).toHaveBeenCalledWith('blockID');
      expect(service.getChildrenBlocks).toHaveBeenCalledWith('blockID');
      expect(service.updateContent).toHaveBeenCalledWith({
        ...oldContent,
        blocks: 'new blocks',
      });
    });
  });

  describe('getChildrenBlocks', () => {
    it(`returns children of a 'notion_block' as string`, async () => {
      const blocks = {
        '987d30a1-48be-410d-b955-231921cebb8d': {
          blockID: '987d30a1-48be-410d-b955-231921cebb8d',
          isUpdating: false,
          lastEditedAt: new Date('2021-11-10 19:26:00'),
          childrenBlocks: JSON.stringify([
            {
              object: 'block',
              id: 'b62faeb8-6c37-48af-bd17-c1cfaded96fc',
              last_edited_time: '2021-11-10T19:26:00.000Z',
              has_children: false,
              type: 'bulleted_list_item',
              bulleted_list_item: {},
            },
          ]),
        },
      };
      blocksRepository.findOneOrFail = jest.fn(
        async (findOpts: any) => blocks[findOpts.blockID],
      );

      const res = await service.getChildrenBlocks(
        '987d30a1-48be-410d-b955-231921cebb8d',
      );

      expect(blocksRepository.findOneOrFail).toBeCalledWith({
        blockID: '987d30a1-48be-410d-b955-231921cebb8d',
      });
      expect(res).toStrictEqual(
        blocks['987d30a1-48be-410d-b955-231921cebb8d'].childrenBlocks,
      );
    });

    it(`recursively resolves children from 'notion_block' table`, async () => {
      const blocks = {
        '0c73cdcb-ad0b-4f47-842d-bde407cbb81e': {
          blockID: '0c73cdcb-ad0b-4f47-842d-bde407cbb81e',
          isUpdating: false,
          lastEditedAt: new Date('2021-11-11 02:03:00'),
          childrenBlocks: JSON.stringify([
            {
              object: 'block',
              id: 'b346d7a9-3b3f-4e36-8242-9b6d8c6d4532',
              last_edited_time: '2021-11-11T02:03:00.000Z',
              has_children: true,
              type: 'paragraph',
              paragraph: {},
            },
          ]),
        },
        'b346d7a9-3b3f-4e36-8242-9b6d8c6d4532': {
          childrenBlocks: JSON.stringify([
            {
              object: 'block',
              id: '3995a737-ce4c-47bc-9500-b51adbd46193',
              last_edited_time: new Date('2021-11-11T02:03:00.000Z'),
              has_children: false,
              paragraph: {},
            },
          ]),
        },
      };
      blocksRepository.findOneOrFail = jest.fn(
        async (findOpts: any) => blocks[findOpts.blockID],
      );
      const getChildrenBlocksSpy = jest.spyOn(service, 'getChildrenBlocks');

      const res = await service.getChildrenBlocks(
        '0c73cdcb-ad0b-4f47-842d-bde407cbb81e',
      );

      expect(blocksRepository.findOneOrFail).toBeCalledWith({
        blockID: '0c73cdcb-ad0b-4f47-842d-bde407cbb81e',
      });
      expect(getChildrenBlocksSpy).toBeCalledWith(
        '0c73cdcb-ad0b-4f47-842d-bde407cbb81e',
      );
      expect(getChildrenBlocksSpy).toBeCalledWith(
        'b346d7a9-3b3f-4e36-8242-9b6d8c6d4532',
      );

      expect(res).toStrictEqual(
        JSON.stringify([
          {
            object: 'block',
            id: 'b346d7a9-3b3f-4e36-8242-9b6d8c6d4532',
            last_edited_time: '2021-11-11T02:03:00.000Z',
            has_children: true,
            type: 'paragraph',
            paragraph: {},
            children: [
              {
                object: 'block',
                id: '3995a737-ce4c-47bc-9500-b51adbd46193',
                last_edited_time: new Date('2021-11-11T02:03:00.000Z'),
                has_children: false,
                paragraph: {},
              },
            ],
          },
        ]),
      );
    });
  });
});
