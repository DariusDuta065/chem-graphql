import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserOutput } from './dto/user.output';
import { UpdateUserInput } from './dto/update-user.input';

import { User } from './user.entity';
import { UserService } from './user.service';
import { Role } from '../auth/enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(RolesGuard)
@Roles(Role.User, Role.Admin)
@Resolver(() => UserOutput)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => [UserOutput])
  public async users(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @Query(() => UserOutput, { nullable: true })
  public async user(@Args('userId') userID: number): Promise<User | undefined> {
    return this.userService.getUserByID(userID);
  }

  @Mutation(() => UserOutput)
  public async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    return this.userService.updateUser(updateUserInput);
  }

  @Mutation(() => Boolean)
  public async deleteUser(@Args('userId') userID: number): Promise<boolean> {
    return this.userService.deleteUser(userID);
  }
}
