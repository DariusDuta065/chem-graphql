import { ExecutionContext, Request, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  GqlExecutionContext,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';

import { User } from 'src/users/user.entity';

import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';

import { CurrentUser } from './decorators/current-user.decorator';

import { TokenOutput } from './dto/token.output';
import { LoginUserInput } from './dto/login-user.input';

import { GqlJwtAuthGuard } from './guards/gql-jwt-auth.guard';
import { GqlLocalAuthGuard } from './guards/gql-local-auth.guard';

@Resolver(() => User)
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

    const token = new TokenOutput();
    token.token = data.access_token;
    token.username = user.username;
    return token;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Query(() => User)
  profile(@CurrentUser() user: User): Promise<User | undefined> {
    return this.usersService.findOneByID(user.userId);
  }
}
