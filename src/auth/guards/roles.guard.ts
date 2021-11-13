import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Role } from '../enums/role.enum';
import { GqlJwtAuthGuard } from './gql-jwt-auth.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserData } from '../../user/dto/user-data.output';

@Injectable()
export class RolesGuard extends GqlJwtAuthGuard {
  constructor(private reflector: Reflector) {
    super();
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Unprotected route
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Validate JWT via GqlJwtAuthGuard
    if (!(await super.canActivate(context))) {
      throw new UnauthorizedException();
    }

    const ctx = GqlExecutionContext.create(context);
    const user: UserData = ctx.getContext().req.user;

    // No user or user role
    if (!user || !user.role) {
      throw new UnauthorizedException();
    }

    // Admin user with full access
    if (user.role === 'admin') {
      return true;
    }

    // Determine if user has one of the required roles
    if (requiredRoles.some((role) => role === user.role)) {
      return true;
    }

    throw new UnauthorizedException();
  }
}
