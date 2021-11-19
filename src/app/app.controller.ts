import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/')
  public index(): string {
    return 'ok';
  }

  @Get('/ping')
  public ping(): string {
    return 'pong';
  }
}
