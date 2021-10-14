import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginUserInput } from './dto/login-user.input';
import { TokenOutput } from './dto/token.output';

@Resolver()
export class AuthResolver {
  //

  constructor(private authSevice: AuthService) {}

  @Mutation((returns) => TokenOutput)
  login(@Args('loginUserInput') loginUserInput: LoginUserInput) {
    return this.authSevice.loginUser(loginUserInput);
  }
}
