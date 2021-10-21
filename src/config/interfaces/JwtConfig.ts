export class JwtConfig {
  static CONFIG_KEY = 'jwt';

  secret: string;
  signOptions: {
    expiresIn: string;
  };
}
