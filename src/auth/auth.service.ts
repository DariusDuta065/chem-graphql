import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginUserInput } from './dto/login-user.input';
import { TokenOutput } from './dto/token.output';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

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

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
