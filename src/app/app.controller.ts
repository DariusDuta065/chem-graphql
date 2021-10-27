import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/')
  index() {
    return 'ok';
  }

  @Get('/ping')
  ping() {
    return 'pong';
  }
}
