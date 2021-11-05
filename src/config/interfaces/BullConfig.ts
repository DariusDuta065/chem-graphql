export class BullConfig {
  public static readonly CONFIG_KEY = 'bull';

  public redis: {
    host: string;
    port: number;
  };
}
