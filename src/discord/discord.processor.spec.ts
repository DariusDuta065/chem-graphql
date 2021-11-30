import { Job } from 'bull';
import { Test, TestingModule } from '@nestjs/testing';
import { ChannelName, SendDiscordMessageJob } from 'src/shared/jobs';

import { DiscordProcessor } from './discord.processor';
import { DiscordService } from './discord.service';

describe('DiscordProcessor', () => {
  let processor: DiscordProcessor;
  let discordService: DiscordService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscordProcessor,
        {
          provide: DiscordService,
          useValue: {},
        },
      ],
    }).compile();

    discordService = module.get<DiscordService>(DiscordService);
    processor = module.get<DiscordProcessor>(DiscordProcessor);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  it('should send Discord messages', async () => {
    discordService.sendMessage = jest.fn();

    const sendDiscordMessageJob: SendDiscordMessageJob = {
      channel: ChannelName.general,
      message: `this is a message`,
    };
    processor.sendDiscordMessageJob({
      data: sendDiscordMessageJob,
    } as Job<SendDiscordMessageJob>);

    expect(discordService.sendMessage).toBeCalledWith(
      ChannelName.general,
      `this is a message`,
    );
  });
});
