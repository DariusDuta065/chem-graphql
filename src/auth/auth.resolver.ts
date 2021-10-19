import {
  BadRequestException,
  ConflictException,
  HttpCode,
  HttpStatus,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
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

import { TokenOutput } from './dto/token.output';
import { CurrentUser } from './decorators/current-user.decorator';

import { GqlJwtAuthGuard } from './guards/gql-jwt-auth.guard';
import { GqlLocalAuthGuard } from './guards/gql-local-auth.guard';

import { Role } from './enums/role.enum';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserData } from '../users/dto/userData.output';
import { UserRegisterInput } from './dto/user-register.input';
import { UserRegisterOutput } from './dto/user-register.output';

@Resolver(() => TokenOutput)
export class AuthResolver {
  constructor(
    private authSevice: AuthService,
    private usersService: UsersService,
  ) {}

  @UseGuards(GqlLocalAuthGuard)
  @Mutation(() => TokenOutput)
  async login(
    @Args('username') username: string,
    @Args('password') password: string,
    @CurrentUser() user: UserData,
  ) {
    const token = await this.authSevice.login(user);
    return TokenOutput.fromToken({ token });
  }

  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @Mutation(() => User)
  async register(
    @Args('userRegisterInput') userRegisterInput: UserRegisterInput,
  ): Promise<User> {
    const user = await this.usersService.registerUser(userRegisterInput);

    if (!user) {
      throw new BadRequestException();
    }

    return user;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Query(() => UserData)
  async profile(
    @CurrentUser() { userId }: User,
  ): Promise<UserData | undefined> {
    const user = await this.usersService.findOneByID(userId);

    if (!user) {
      throw new UnauthorizedException();
    }
    return UserData.fromUser(user);
  }

  @ResolveField(() => UserData)
  async userData(@Parent() token: TokenOutput): Promise<UserData> {
    const userId = this.authSevice.decodeUserId(token.token);

    if (!userId) {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findOneByID(userId);

    if (!user) {
      throw new UnauthorizedException();
    }
    return UserData.fromUser(user);
  }

  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @Query(() => String)
  sayHeyAdmin() {
    return 'admin role';
  }

  @Roles(Role.User)
  @UseGuards(RolesGuard)
  @Query(() => String)
  sayHeyUser() {
    return 'user role';
  }

  @Query(() => String)
  sayHeyUnauth() {
    return 'public';
  }
}
