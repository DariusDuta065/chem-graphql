import {
  Logger,
  Inject,
  UseGuards,
  CACHE_MANAGER,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

import {
  Args,
  Query,
  Parent,
  Mutation,
  Resolver,
  ResolveField,
} from '@nestjs/graphql';

import { Cache } from 'cache-manager';

import { User } from '../users/user.entity';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

import { TokenOutput } from './dto/token.output';
import { CurrentUser } from './decorators/current-user.decorator';

import { GqlJwtAuthGuard } from './guards/gql-jwt-auth.guard';
import { GqlLocalAuthGuard } from './guards/gql-local-auth.guard';

import { Role } from './enums/role.enum';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserData } from '../users/dto/userData.output';
import { UserRegisterInput } from './dto/user-register.input';

@Resolver(() => TokenOutput)
export class AuthResolver {
  private readonly logger = new Logger(AuthResolver.name);

  constructor(
    private authSevice: AuthService,
    private usersService: UsersService,

    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @UseGuards(GqlLocalAuthGuard)
  @Mutation(() => TokenOutput)
  async login(
    @Args('username') username: string,
    @Args('password') password: string,
    @CurrentUser() user: UserData,
  ) {
    try {
      return TokenOutput.fromTokens(await this.authSevice.login(user));
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(err.message);
      }
      throw new UnauthorizedException();
    }
  }

  @Mutation(() => TokenOutput)
  async refreshToken(@Args('refreshToken') refreshToken: string) {
    try {
      return TokenOutput.fromTokens(
        await this.authSevice.refreshTokens(refreshToken),
      );
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(err.message);
      }
      throw new UnauthorizedException();
    }
  }

  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @Mutation(() => User)
  async register(
    @Args('userRegisterInput') userRegisterInput: UserRegisterInput,
  ): Promise<User> {
    const user = await this.authSevice.register(userRegisterInput);

    if (!user) {
      throw new BadRequestException();
    }

    return user;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Query(() => UserData)
  async profile(@CurrentUser() { userId }: User): Promise<UserData> {
    const user = await this.usersService.findOneByID(userId);

    if (!user) {
      throw new UnauthorizedException();
    }
    return UserData.fromUser(user);
  }

  @ResolveField(() => UserData)
  async userData(@Parent() tokens: TokenOutput): Promise<UserData> {
    try {
      return await this.authSevice.fetchUserInfo(tokens);
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(err.message);
      }
      throw new UnauthorizedException();
    }
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
