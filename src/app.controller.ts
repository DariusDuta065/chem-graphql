import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PetsDTO } from './app.types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  private async getHello(): Promise<PetsDTO> {
    return await this.appService.getPets();
  }
}
