import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ChannelName } from 'src/shared/jobs';

import { DiscordService } from './discord.service';
import * as grpc from '@grpc/grpc-js';

// import { DiscordBotClient } from './proto/chembuff_grpc_pb';
import * as services from './proto/chembuff_grpc_pb';
import * as messages from './proto/chembuff_pb';

import { MessageReply, MessageRequest } from './proto/chembuff_pb';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { Logger } from '@nestjs/common';

describe('DiscordService', () => {
  let module: TestingModule;

  let service: DiscordService;
  let configService: ConfigService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        DiscordService,
        {
          provide: ConfigService,
          useValue: {},
        },
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
    service = module.get<DiscordService>(DiscordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have a default value for the gRpc host', () => {
    configService.get = jest.fn(() => {
      return undefined;
    });
    const sendMessageMock = jest.fn((...args) => {
      const messageRequest: MessageRequest = args[0];
      const messageReply = new MessageReply();
      messageReply.setMessage(messageRequest.getMessage());
      args[1](null, messageReply);
    });
    const handleMessageReply = jest
      .spyOn(DiscordService.prototype as any, 'handleMessageReply')
      .mockImplementationOnce((...args) => {
        // const reply: MessageReply = args[1] as MessageReply;
      });
    jest
      .spyOn(services.DiscordBotClient.prototype as any, 'sendMessage')
      .mockImplementationOnce(sendMessageMock);

    service.sendMessage(ChannelName.general, `this is a message`);

    const messageRequest = new MessageRequest();
    messageRequest.setChannel(ChannelName.general);
    messageRequest.setMessage(`this is a message`);
    expect(sendMessageMock).toBeCalledWith(
      messageRequest,
      expect.any(Function),
    );

    const messageReply = new MessageReply();
    messageReply.setMessage(messageRequest.getMessage());
    expect(handleMessageReply).toBeCalledWith(null, messageReply);
  });

  it('should send the message via gRPC', () => {
    configService.get = jest.fn(() => {
      return 'localhost:50051';
    });
    const sendMessageMock = jest.fn((...args) => {
      const messageRequest: MessageRequest = args[0];
      const messageReply = new MessageReply();
      messageReply.setMessage(messageRequest.getMessage());
      args[1](null, messageReply);
    });
    const handleMessageReply = jest
      .spyOn(DiscordService.prototype as any, 'handleMessageReply')
      .mockImplementationOnce((...args) => {
        // const reply: MessageReply = args[1] as MessageReply;
      });
    jest
      .spyOn(services.DiscordBotClient.prototype as any, 'sendMessage')
      .mockImplementationOnce(sendMessageMock);

    service.sendMessage(ChannelName.general, `this is a message`);

    const messageRequest = new MessageRequest();
    messageRequest.setChannel(ChannelName.general);
    messageRequest.setMessage(`this is a message`);
    expect(sendMessageMock).toBeCalledWith(
      messageRequest,
      expect.any(Function),
    );

    const messageReply = new MessageReply();
    messageReply.setMessage(messageRequest.getMessage());
    expect(handleMessageReply).toBeCalledWith(null, messageReply);
  });

  it('should handle MessageReply', async () => {
    configService.get = jest.fn(() => {
      return 'localhost:50051';
    });

    Logger.debug = jest.fn();
    const messageReply = new MessageReply();
    messageReply.setMessage(`this is a message`);

    service.handleMessageReply.apply({ logger: Logger }, [null, messageReply]);

    expect(Logger.debug).toBeCalledWith('Sent message: this is a message');
  });

  it('should log errors', async () => {
    configService.get = jest.fn(() => {
      return 'localhost:50051';
    });

    Logger.error = jest.fn();
    const messageReply = new MessageReply();
    messageReply.setMessage(`this is a message`);
    const error: grpc.ServiceError = {
      name: 'grpc error',
      message: 'error with grpc',
      code: Status.UNKNOWN,
      details: 'grpc failed',
      metadata: new grpc.Metadata(),
    };

    service.handleMessageReply.apply({ logger: Logger }, [error, messageReply]);

    expect(Logger.error).toBeCalledWith('error with grpc');
  });
});
