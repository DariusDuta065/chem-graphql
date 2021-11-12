import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Group } from './group.entity';
import { GroupService } from './group.service';
import { CreateGroupInput } from './dto/create-group.input';
import { UpdateGroupInput } from './dto/update-group.input';

@Resolver(() => Group)
export class GroupResolver {
  constructor(private groupService: GroupService) {}

  @Query(() => [Group])
  public async groups(): Promise<Group[]> {
    return this.groupService.getGroups();
  }

  @Query(() => Group, { nullable: true })
  public async group(
    @Args('groupId') groupID: number,
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
  public async deleteGroup(@Args('groupId') groupID: number): Promise<boolean> {
    return this.groupService.deleteGroup(groupID);
  }
}
