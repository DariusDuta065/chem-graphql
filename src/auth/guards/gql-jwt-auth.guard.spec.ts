import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from './gql-jwt-auth.guard';

describe('RolesGuard', () => {
  let gqlJwtAuthGuard: GqlJwtAuthGuard;

  beforeAll(() => {
    gqlJwtAuthGuard = new GqlJwtAuthGuard();
  });

  it('should be defined', () => {
    expect(gqlJwtAuthGuard).toBeDefined();
    expect(gqlJwtAuthGuard.getRequest).toBeInstanceOf(Function);
    expect(gqlJwtAuthGuard.canActivate).toBeInstanceOf(Function);
  });

  it(`should extend AuthGuard('jwt')`, () => {
    expect(gqlJwtAuthGuard).toBeInstanceOf(AuthGuard('jwt'));
  });

  describe('canActivate', () => {
    it('should handle req when parent activates', async () => {
      const mockContext = {} as ExecutionContext;
      GqlJwtAuthGuard.prototype.canActivate = jest.fn(() => true);

      const canActivate = await gqlJwtAuthGuard.canActivate(mockContext);

      expect(canActivate).toBeTruthy();
      expect(GqlJwtAuthGuard.prototype.canActivate).toBeCalledTimes(1);
      expect(GqlJwtAuthGuard.prototype.canActivate).toBeCalledWith(mockContext);
    });

    it('should block req when parent blocks', async () => {
      const mockContext = {} as ExecutionContext;
      GqlJwtAuthGuard.prototype.canActivate = jest.fn(() => false);

      const canActivate = await gqlJwtAuthGuard.canActivate(mockContext);

      expect(canActivate).toBeFalsy();
      expect(GqlJwtAuthGuard.prototype.canActivate).toBeCalledTimes(1);
      expect(GqlJwtAuthGuard.prototype.canActivate).toBeCalledWith(mockContext);
    });
  });

  describe('getRequest', () => {
    let originalCreate: (context: ExecutionContext) => GqlExecutionContext;

    beforeAll(() => {
      originalCreate = GqlExecutionContext.create;

      GqlExecutionContext.create = jest.fn(() => {
        return {
          getContext() {
            return {
              req: 'request',
            };
          },
        } as GqlExecutionContext;
      });
    });

    afterAll(() => {
      GqlExecutionContext.create = originalCreate;
    });

    it('should convert context to GqlExecutionContext', () => {
      const mockContext = {} as ExecutionContext;

      gqlJwtAuthGuard.getRequest(mockContext);

      expect(GqlExecutionContext.create).toBeCalledTimes(1);
      expect(GqlExecutionContext.create).toBeCalledWith(mockContext);
    });

    it('should return the request of the Gql exec ctx', () => {
      const mockContext = {} as ExecutionContext;

      const res = gqlJwtAuthGuard.getRequest(mockContext);

      expect(res).toBe('request');
    });
  });
});
