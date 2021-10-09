import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginUserInput } from './dto/login-user.input';

@Resolver()
export class AuthResolver {
  //

  constructor(private authSevice: AuthService) {}

  @Mutation((returns) => String)
  login(@Args('loginUserInput') loginUserInput: LoginUserInput) {
    return this.authSevice.loginUser(loginUserInput);
  }
}
