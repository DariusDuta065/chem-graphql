import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GqlLocalAuthGuard extends AuthGuard('local') {
  public getRequest(context: ExecutionContext): any {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;

    // Add GraphQL variables into req.body for passport-local
    const { username, password } = req.body.variables;

    req.body.username = username;
    req.body.password = password;
    return req;
  }
}
