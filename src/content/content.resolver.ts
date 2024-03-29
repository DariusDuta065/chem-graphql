import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Content } from './content.entity';
import { ContentService } from './content.service';

import { Role } from 'src/auth/enums/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserData } from 'src/user/dto/user-data.output';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

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
    @Args('contentId', { type: () => Int }) contentID: number,
    @CurrentUser() user: UserData,
  ): Promise<Content | undefined> {
    if (!user || !user.id) {
      throw new UnauthorizedException();
    }

    return this.contentService.getContentForUser(user.id, contentID);
  }

  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @Mutation(() => String)
  public async refreshContents(): Promise<string> {
    this.contentService.refreshContents();
    return 'ok';
  }

  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @Mutation(() => String)
  public async refreshContent(
    @Args('contentId', { type: () => Int }) contentID: number,
  ): Promise<string> {
    this.contentService.refreshContent(contentID);
    return 'ok';
  }
}
