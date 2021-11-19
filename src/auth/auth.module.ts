import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';

import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';

import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

import { GqlJwtAuthGuard } from './guards/gql-jwt-auth.guard';
import { GqlLocalAuthGuard } from './guards/gql-local-auth.guard';

import { JwtConfigService } from 'src/config/services/jwtConfigService';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
  ],
  providers: [
    AuthService,
    AuthResolver,

    LocalStrategy,
    JwtStrategy,

    GqlJwtAuthGuard,
    GqlLocalAuthGuard,

    JwtConfigService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
