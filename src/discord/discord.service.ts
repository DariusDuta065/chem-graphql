import * as grpc from '@grpc/grpc-js';

import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';

import { ChannelName } from 'src/shared/jobs';

import * as messages from './proto/chembuff_pb';
import * as services from './proto/chembuff_grpc_pb';

@Injectable()
export class DiscordService {
  private discordBotClient: services.DiscordBotClient;
  private readonly logger = new Logger(DiscordService.name);

  constructor(private configService: ConfigService) {
    const configHost = configService.get<string>('discordBot.host');
    const gRpcHost = configHost ?? 'localhost:50051';

    this.discordBotClient = new services.DiscordBotClient(
      gRpcHost,
      grpc.credentials.createInsecure(),
    );
  }

  public sendMessage(channel: ChannelName, message: string): void {
    this.logger.log(`sending ${message} on chnl: ${channel}`);

    const request = new messages.MessageRequest();
    request.setChannel(channel);
    request.setMessage(message);

    this.discordBotClient.sendMessage(
      request,
      this.handleHelloReply.bind({ logger: this.logger }),
    );
  }

  private handleHelloReply(
    err: grpc.ServiceError | null,
    response: messages.MessageReply,
  ): void {
    if (err) {
      this.logger.error(err.message);
    }
    this.logger.debug(`Sent message: ${response.getMessage()}`);
  }
}
