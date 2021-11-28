import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordService {
  private gRpcHost: string;

  constructor(private configService: ConfigService) {
    const configHost = configService.get<string>('discordBot.host');
    this.gRpcHost = configHost ?? 'localhost:50051';
  }

  public sendMessage(channel: string, message: string): void {
    console.log(`sending ${message} on chnl: ${channel}`);
  }
}
