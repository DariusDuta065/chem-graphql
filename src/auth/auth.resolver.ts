import {
  Logger,
  UseGuards,
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
  Int,
} from '@nestjs/graphql';

import { User } from 'src/user/user.entity';

import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';

import { TokenOutput } from './dto/token.output';
import { CurrentUser } from './decorators/current-user.decorator';

import { GqlJwtAuthGuard } from './guards/gql-jwt-auth.guard';
import { GqlLocalAuthGuard } from './guards/gql-local-auth.guard';

import { Role } from './enums/role.enum';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserData } from 'src/user/dto/user-data.output';
import { UserRegisterInput } from './dto/user-register.input';

@Resolver(() => TokenOutput)
export class AuthResolver {
  private readonly logger = new Logger(AuthResolver.name);

  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @UseGuards(GqlLocalAuthGuard)
  @Mutation(() => TokenOutput)
  public async login(
    @Args('username') username: string,
    @Args('password') password: string,
    @CurrentUser() user: UserData,
  ): Promise<TokenOutput> {
    try {
      return TokenOutput.fromTokens(await this.authService.login(user));
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(err.message);
      }
      throw new UnauthorizedException();
    }
  }

  @Mutation(() => String)
  public async logout(
    @Args('refreshToken') refreshToken: string,
  ): Promise<string> {
    try {
      await this.authService.logout(refreshToken);
      return 'ok';
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw new UnauthorizedException();
    }
  }

  @Mutation(() => TokenOutput)
  public async refreshToken(
    @Args('refreshToken') refreshToken: string,
  ): Promise<TokenOutput> {
    try {
      return TokenOutput.fromTokens(
        await this.authService.refreshTokens(refreshToken),
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
  public async register(
    @Args('userRegisterInput') userRegisterInput: UserRegisterInput,
  ): Promise<User> {
    try {
      const user = await this.authService.register(userRegisterInput);

      if (!user) {
        throw new BadRequestException();
      }

      return user;
    } catch (error) {
      throw new BadRequestException();
    }
  }

  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @Mutation(() => User)
  public async resetPassword(
    @Args('userID', { type: () => Int }) userID: number,
  ): Promise<User> {
    return this.authService.resetPassword(userID);
  }

  @UseGuards(GqlJwtAuthGuard)
  @Query(() => UserData)
  public async profile(@CurrentUser() { id: userId }: User): Promise<UserData> {
    const user = await this.userService.getUserByID(userId);

    if (!user) {
      throw new UnauthorizedException();
    }
    return UserData.fromUser(user);
  }

  @ResolveField()
  public async userData(@Parent() tokens: TokenOutput): Promise<UserData> {
    try {
      return await this.authService.fetchUserInfo(tokens);
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
  public adminRoute(): string {
    return 'admin';
  }

  @Roles(Role.User)
  @UseGuards(RolesGuard)
  @Query(() => String)
  public userRoute(): string {
    return 'user';
  }

  @Query(() => String)
  public publicRoute(): string {
    return 'public';
  }
}
