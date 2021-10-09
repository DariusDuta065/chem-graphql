import { Injectable } from '@nestjs/common';
import { LoginUserInput } from './dto/login-user.input';

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

    return '123.123';
  }
}
