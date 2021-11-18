import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Role } from '../auth/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

import { Group } from './group.entity';
import { GroupService } from './group.service';
import { CreateGroupInput } from './dto/create-group.input';
import { UpdateGroupInput } from './dto/update-group.input';

@UseGuards(RolesGuard)
@Roles(Role.Admin)
@Resolver(() => Group)
export class GroupResolver {
  constructor(private groupService: GroupService) {}

  @Query(() => [Group])
  public async groups(): Promise<Group[]> {
    return this.groupService.getGroups();
  }

  @Query(() => Group, { nullable: true })
  public async group(
    @Args('groupId', { type: () => Int }) groupID: number,
  ): Promise<Group | undefined> {
    return this.groupService.getGroupByID(groupID);
  }

  @Mutation(() => Group)
  public async createGroup(
    @Args('createGroupInput') createGroupInput: CreateGroupInput,
  ): Promise<Group> {
    return this.groupService.createGroup(createGroupInput);
  }

  @Mutation(() => Group)
  public async updateGroup(
    @Args('updateGroupInput') updateGroupInput: UpdateGroupInput,
  ): Promise<Group> {
    return this.groupService.updateGroup(updateGroupInput);
  }

  @Mutation(() => Boolean)
  public async deleteGroup(
    @Args('groupId', { type: () => Int }) groupID: number,
  ): Promise<boolean> {
    return this.groupService.deleteGroup(groupID);
  }
}
