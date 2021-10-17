import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { User } from 'src/users/user.entity';

import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';

import { CurrentUser } from './decorators/current-user.decorator';
import { TokenOutput } from './dto/token.output';

import { GqlJwtAuthGuard } from './guards/gql-jwt-auth.guard';
import { GqlLocalAuthGuard } from './guards/gql-local-auth.guard';
import { UserData } from './dto/userData.output';

@Resolver(() => TokenOutput)
export class AuthResolver {
  //

  constructor(
    private authSevice: AuthService,
    private usersService: UsersService,
  ) {}

  @UseGuards(GqlLocalAuthGuard)
  @Mutation(() => TokenOutput)
  async login(
    @Args('username') username: string,
    @Args('password') password: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.authSevice.login(user);
    return TokenOutput.fromToken({ token: data.access_token });
  }

  @UseGuards(GqlJwtAuthGuard)
  @Query(() => User)
  profile(@CurrentUser() user: User): Promise<User | undefined> {
    return this.usersService.findOneByID(user.userId);
  }

  @ResolveField(() => UserData)
  async userData(@Parent() token: TokenOutput): Promise<UserData> {
    const userId: number | null = this.authSevice.decodeUserId(token.token);

    const user: User | null = await this.usersService.findOneByID(userId);

    const userData = new UserData();
    userData.userId = user.userId;
    userData.username = user.username;
    return userData;
  }
}
