import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { Content } from './content.entity';
import { ContentService } from './content.service';

import { Role } from '../auth/enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserData } from '../user/dto/user-data.output';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(RolesGuard)
@Roles(Role.User, Role.Admin)
@Resolver(() => Content)
export class ContentResolver {
  constructor(private contentService: ContentService) {}

  @Query(() => [Content])
  public async contents(@CurrentUser() user: UserData): Promise<Content[]> {
    if (!user || !user.id) {
      throw new UnauthorizedException();
    }

    return this.contentService.getContentsForUser(user.id);
  }

  @Query(() => Content, { nullable: true })
  public async content(
    @Args('contentId') contentID: number,
    @CurrentUser() user: UserData,
  ): Promise<Content | undefined> {
    if (!user || !user.id) {
      throw new UnauthorizedException();
    }

    return this.contentService.getContentForUser(user.id, contentID);
  }
}
