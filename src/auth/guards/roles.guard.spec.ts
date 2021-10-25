import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { RolesGuard } from './roles.guard';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GqlJwtAuthGuard } from './gql-jwt-auth.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('GqlJwtAuthGuard', () => {
  it('should be defined', () => {
    const reflector = new Reflector();
    const rolesGuard = new RolesGuard(reflector);

    expect(rolesGuard).toBeDefined();
    expect(rolesGuard.canActivate).toBeInstanceOf(Function);
  });

  describe('canActivate', () => {
    const mockContext = {
      getHandler() {
        return {};
      },
      getClass() {
        return {};
      },
      getType() {
        return 'type';
      },
      switchToHttp() {
        return {
          getResponse() {
            return {};
          },
        };
      },
    } as ExecutionContext;

    it('should fetch roles via reflection', async () => {
      const reflector = new Reflector();
      const rolesGuard = new RolesGuard(reflector);

      reflector.getAllAndOverride = jest.fn().mockReturnValueOnce([]);

      await rolesGuard.canActivate(mockContext);

      expect(reflector.getAllAndOverride).toBeCalledWith(ROLES_KEY, [{}, {}]);
    });

    it(`should validate JWT via AuthGuard('jwt')`, async () => {
      const reflector = new Reflector();
      const rolesGuard = new RolesGuard(reflector);

      const mockGqlContext = {
        getContext() {
          return {
            req: {
              user: {
                role: 'any',
              },
            },
          };
        },
      } as GqlExecutionContext;
      const requiredRoles = ['any'];

      reflector.getAllAndOverride = jest.fn().mockReturnValue(requiredRoles);
      GqlJwtAuthGuard.prototype.canActivate = jest.fn(async () => true);
      GqlExecutionContext.create = jest.fn().mockReturnValue(mockGqlContext);

      await rolesGuard.canActivate(mockContext);

      expect(GqlJwtAuthGuard.prototype.canActivate).toBeCalled();
    });

    it(`should fetch user from request`, async () => {
      const reflector = new Reflector();
      const rolesGuard = new RolesGuard(reflector);

      const mockGqlContext = {
        getContext() {
          return {
            req: {
              user: {
                role: 'any',
              },
            },
          };
        },
      } as GqlExecutionContext;
      const requiredRoles = ['any'];

      reflector.getAllAndOverride = jest.fn().mockReturnValue(requiredRoles);
      GqlJwtAuthGuard.prototype.canActivate = jest.fn(async () => true);
      GqlExecutionContext.create = jest.fn().mockReturnValue(mockGqlContext);

      await rolesGuard.canActivate(mockContext);

      expect(GqlExecutionContext.create).toBeCalledWith(mockContext);
    });

    it('should allow unprotected routes', async () => {
      const reflector = new Reflector();
      const rolesGuard = new RolesGuard(reflector);

      reflector.getAllAndOverride = jest.fn().mockReturnValue([]);

      const res = await rolesGuard.canActivate(mockContext);
      expect(res).toBeTruthy();
    });

    it('should throw 401 if GqlJwtAuthGuard blocks request', async () => {
      const reflector = new Reflector();
      const rolesGuard = new RolesGuard(reflector);

      const mockGqlContext = {
        getContext() {
          return {
            req: {
              user: {
                role: 'any',
              },
            },
          };
        },
      } as GqlExecutionContext;
      const requiredRoles = ['any'];

      reflector.getAllAndOverride = jest.fn().mockReturnValue(requiredRoles);
      GqlJwtAuthGuard.prototype.canActivate = jest.fn(async () => false);
      GqlExecutionContext.create = jest.fn().mockReturnValue(mockGqlContext);

      expect(rolesGuard.canActivate(mockContext)).rejects.toThrowError(
        UnauthorizedException,
      );
    });

    it('should throw 401 if user data is invalid', async () => {
      const reflector = new Reflector();
      const rolesGuard = new RolesGuard(reflector);

      const mockGqlContext = {
        getContext() {
          return {
            req: {
              user: null,
            },
          };
        },
      } as GqlExecutionContext;
      const requiredRoles = ['admin'];

      reflector.getAllAndOverride = jest.fn().mockReturnValue(requiredRoles);
      GqlJwtAuthGuard.prototype.canActivate = jest.fn(async () => true);
      GqlExecutionContext.create = jest.fn().mockReturnValue(mockGqlContext);

      expect(rolesGuard.canActivate(mockContext)).rejects.toThrowError(
        UnauthorizedException,
      );
    });

    it('should always allow admins to carry on', async () => {
      const reflector = new Reflector();
      const rolesGuard = new RolesGuard(reflector);

      const mockGqlContext = {
        getContext() {
          return {
            req: {
              user: {
                role: 'admin',
              },
            },
          };
        },
      } as GqlExecutionContext;
      const requiredRoles = ['any'];

      reflector.getAllAndOverride = jest.fn().mockReturnValue(requiredRoles);
      GqlJwtAuthGuard.prototype.canActivate = jest.fn(async () => true);
      GqlExecutionContext.create = jest.fn().mockReturnValue(mockGqlContext);

      const res = await rolesGuard.canActivate(mockContext);
      expect(res).toBeTruthy();
    });

    it('should check if user has one of the required roles', async () => {
      const reflector = new Reflector();
      const rolesGuard = new RolesGuard(reflector);

      const mockGqlContext = {
        getContext() {
          return {
            req: {
              user: {
                role: 'userRole',
              },
            },
          };
        },
      } as GqlExecutionContext;
      const requiredRoles = ['userRole', 'adminRole'];

      reflector.getAllAndOverride = jest.fn().mockReturnValue(requiredRoles);
      GqlJwtAuthGuard.prototype.canActivate = jest.fn(async () => true);
      GqlExecutionContext.create = jest.fn().mockReturnValue(mockGqlContext);

      const res = await rolesGuard.canActivate(mockContext);
      expect(res).toBeTruthy();
    });

    it('should finally throw 401 if user does not have one of the required roles', async () => {
      const reflector = new Reflector();
      const rolesGuard = new RolesGuard(reflector);

      const mockGqlContext = {
        getContext() {
          return {
            req: {
              user: {
                role: 'user',
              },
            },
          };
        },
      } as GqlExecutionContext;
      const requiredRoles = ['admin'];

      reflector.getAllAndOverride = jest.fn().mockReturnValue(requiredRoles);
      GqlJwtAuthGuard.prototype.canActivate = jest.fn(async () => true);
      GqlExecutionContext.create = jest.fn().mockReturnValue(mockGqlContext);

      expect(rolesGuard.canActivate(mockContext)).rejects.toThrowError(
        UnauthorizedException,
      );
    });
  });
});
