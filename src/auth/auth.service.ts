import { Injectable } from '@nestjs/common';
import { LoginUserInput } from './dto/login-user.input';
import { TokenOutput } from './dto/token.output';

@Injectable()
export class AuthService {
  constructor() {
    console.log('AuthService');
  }

  loginUser(loginUserInput: LoginUserInput) {
    const { username, password } = loginUserInput;

    if (username === 'donot' || password === 'donot') {
      throw new Error('Invalid credentials');
    }

    const token = '123.456.789';

    return TokenOutput.fromUser({
      token,
      username,
    });
  }
}
