import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';

import { ContentResolver } from './content.resolver';
import { ContentService } from './content.service';
import { UserData } from '../user/dto/user-data.output';

describe('ContentResolver', () => {
  let resolver: ContentResolver;
  let contentService: ContentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentResolver,
        {
          provide: ContentService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<ContentResolver>(ContentResolver);
    contentService = module.get<ContentService>(ContentService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('contents', () => {
    it(`should return all available contents for a user`, async () => {
      const user: UserData = {
        id: 1,
        email: 'email@test.com',
        firstName: 'first name',
        lastName: 'last name',
        role: 'user',
      };
      contentService.getContentsForUser = jest.fn();

      await resolver.contents(user);

      expect(contentService.getContentsForUser).toBeCalledWith(user.id);
    });

    it(`should throw 401 if user is invalid`, async () => {
      const user = {} as UserData;

      expect(resolver.contents(user)).rejects.toThrowError(
        UnauthorizedException,
      );
    });
  });

  describe('content', () => {
    it(`should return content by ID if available for user`, async () => {
      const user: UserData = {
        id: 1,
        email: 'email@test.com',
        firstName: 'first name',
        lastName: 'last name',
        role: 'user',
      };
      const contentID = 1;

      contentService.getContentForUser = jest.fn();

      await resolver.content(contentID, user);

      expect(contentService.getContentForUser).toBeCalledWith(
        user.id,
        contentID,
      );
    });

    it(`should throw 401 if user is invalid`, async () => {
      const user = {} as UserData;
      const contentID = 1;

      expect(resolver.content(contentID, user)).rejects.toThrowError(
        UnauthorizedException,
      );
    });
  });
});
