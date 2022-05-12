import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ChannelName } from 'src/shared/jobs';

import { DiscordService } from './discord.service';

interface SendMessageResponse {
  success: boolean;
  error: string;
}

describe('DiscordService', () => {
  let module: TestingModule;

  let service: DiscordService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        DiscordService,
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: HttpService,
          useValue: {},
        },
      ],
    }).compile();

    httpService = module.get<HttpService>(HttpService);
    service = module.get<DiscordService>(DiscordService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send the message via the discord bot', () => {
    configService.get = jest.fn(() => {
      return 'http://localhost:50051/send-message';
    });
    httpService.post = jest.fn().mockImplementation(() => {
      return new Observable<AxiosResponse<SendMessageResponse>>(
        (subscriber) => {
          subscriber.next({
            data: {
              success: true,
              error: '',
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {},
          });
        },
      );
    });

    service.sendMessage(ChannelName.general, `this is a message`);

    expect(httpService.post).toBeCalledWith(
      'http://localhost:50051/send-message',
      {
        channel: 'general',
        message: 'this is a message',
      },
    );
  });

  it('should log out errors', () => {
    configService.get = jest.fn(() => {
      return 'http://localhost:50051/send-message';
    });

    const err = {
      response: {
        status: 429,
      },
    };

    httpService.post = jest.fn().mockImplementation(() => {
      return new Observable<AxiosResponse<SendMessageResponse>>(
        (subscriber) => {
          subscriber.error(err);
        },
      );
    });
    const loggerSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(jest.fn());

    service.sendMessage(ChannelName.general, `this is a message`);

    expect(httpService.post).toBeCalledWith(
      'http://localhost:50051/send-message',
      {
        channel: 'general',
        message: 'this is a message',
      },
    );
    expect(loggerSpy).toBeCalledWith(
      `Error sending message ${err.response?.status || ''}`,
    );
  });
});
