import { map } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';

import { ChannelName } from 'src/shared/jobs';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  public sendMessage(channel: ChannelName, message: string): void {
    const discordBotEndpoint = this.configService.get<string>(
      'discordBot.host',
      '',
    );

    const sendMessageRequest: SendMessageRequest = {
      channel,
      message,
    };

    this.httpService
      .post<SendMessageResponse>(discordBotEndpoint, sendMessageRequest)
      .pipe(map((response) => response.data))
      .subscribe({
        complete: () => {
          this.logger.debug('Sent message to Discord');
        },
        error: (err: AxiosError) => {
          this.logger.error(
            `Error sending message ${err.response?.status || ''}`,
          );
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
