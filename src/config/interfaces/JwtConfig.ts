export class JwtConfig {
  public static CONFIG_KEY = 'jwt';

  public secret: string;
  public signOptions: {
    expiresIn: string;
  };
}
