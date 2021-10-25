import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { GqlLocalAuthGuard } from './gql-local-auth.guard';

describe('GqlLocalAuthGuard', () => {
  let gqlLocalAuthGuard: GqlLocalAuthGuard;

  beforeAll(() => {
    gqlLocalAuthGuard = new GqlLocalAuthGuard();
  });

  it('should be defined', () => {
    expect(gqlLocalAuthGuard).toBeDefined();
    expect(gqlLocalAuthGuard.getRequest).toBeInstanceOf(Function);
    expect(gqlLocalAuthGuard.canActivate).toBeInstanceOf(Function);
  });

  it(`should extend AuthGuard('local')`, () => {
    expect(gqlLocalAuthGuard).toBeInstanceOf(AuthGuard('local'));
  });

  describe('getRequest', () => {
    let originalCreate: (context: ExecutionContext) => GqlExecutionContext;

    beforeAll(() => {
      originalCreate = GqlExecutionContext.create;

      GqlExecutionContext.create = jest.fn(() => {
        return {
          getContext() {
            return {
              req: {
                body: {
                  variables: {
                    username: 'username',
                    password: 'password',
                  },
                },
              },
            };
          },
        } as GqlExecutionContext;
      });
    });

    afterAll(() => {
      GqlExecutionContext.create = originalCreate;
    });

    it('should convert context to Gql exec ctx', () => {
      const mockContext = {} as ExecutionContext;

      gqlLocalAuthGuard.getRequest(mockContext);

      expect(GqlExecutionContext.create).toBeCalledTimes(1);
      expect(GqlExecutionContext.create).toBeCalledWith(mockContext);
    });

    it('should attach user & pass to req.body', () => {
      const mockContext = {} as ExecutionContext;

      const res = gqlLocalAuthGuard.getRequest(mockContext);

      expect(res.body.username).toBe('username');
      expect(res.body.password).toBe('password');
    });
  });
});
