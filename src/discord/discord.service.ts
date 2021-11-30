import { map } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';

import { ChannelName } from 'src/shared/jobs';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  public sendMessage(channel: ChannelName, message: string): void {
    const discordBotHost = this.configService.get<string>(
      'discordBot.host',
      'localhost:50051',
    );
    const endpointURL = `http://${discordBotHost}/send-message`;

    const sendMessageRequest: SendMessageRequest = {
      channel,
      message,
    };

    this.httpService
      .post<SendMessageResponse>(endpointURL, sendMessageRequest)
      .pipe(map((response) => response.data))
      .subscribe({
        // next: (res: SendMessageResponse) => {
        //   this.logger.debug(res);
        // },
        error: (err) => {
          this.logger.error('SendMessageRequest Error', err);
        },
      });
  }
}

interface SendMessageRequest {
  channel: string;
  message: string;
}

interface SendMessageResponse {
  success: boolean;
  error: string;
}
