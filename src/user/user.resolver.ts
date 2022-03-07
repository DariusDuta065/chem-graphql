import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserOutput } from './dto/user.output';
import { UpdateUserInput } from './dto/update-user.input';

import { User } from './user.entity';
import { UserService } from './user.service';
import { Role } from 'src/auth/enums/role.enum';

import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@UseGuards(RolesGuard)
@Roles(Role.Admin)
@Resolver(() => UserOutput)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => [User])
  public async users(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @Query(() => UserOutput, { nullable: true })
  public async user(
    @Args('userId', { type: () => Int }) userID: number,
  ): Promise<User | undefined> {
    return this.userService.getUserByID(userID);
  }

  @Mutation(() => UserOutput)
  public async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    return this.userService.updateUser(updateUserInput);
  }

  @Mutation(() => Boolean)
  public async deleteUser(
    @Args('userId', { type: () => Int }) userID: number,
  ): Promise<boolean> {
    return this.userService.deleteUser(userID);
  }
}
