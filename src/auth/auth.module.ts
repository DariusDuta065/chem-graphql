import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';

import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';

import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

import { GqlJwtAuthGuard } from './guards/gql-jwt-auth.guard';
import { GqlLocalAuthGuard } from './guards/gql-local-auth.guard';

import { AuthConfigService } from '../config/services/authConfigService';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      useClass: AuthConfigService,
    }),
  ],
  providers: [
    AuthService,
    AuthResolver,

    LocalStrategy,
    JwtStrategy,

    GqlJwtAuthGuard,
    GqlLocalAuthGuard,

    AuthConfigService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
