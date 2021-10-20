import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UserData } from '../../users/dto/userData.output';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { GqlJwtAuthGuard } from './gql-jwt-auth.guard';

@Injectable()
export class RolesGuard extends GqlJwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Unprotected route
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const user: UserData = ctx.getContext().req.user;

    // console.log(`roles required: ${requiredRoles}; have: ${user.role}`);

    // No user or user role
    if (!user || !user.role) {
      throw new UnauthorizedException();
    }

    // Admin user with full access
    if (user.role === 'admin') {
      return true;
    }

    if (user.role === requiredRoles[0]) {
      return true;
    }

    throw new UnauthorizedException();
  }
}
