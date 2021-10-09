import { Injectable } from '@nestjs/common';
import { LoginUserInput } from './dto/login-user.input';
import { LoginUserOutput } from './dto/login-user.output';

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

    const tokenData = new LoginUserOutput();
    tokenData.token = '123.123.123';
    tokenData.username = username;

    return tokenData;
  }
}
