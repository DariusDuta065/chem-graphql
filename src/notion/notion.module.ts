import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotionService } from './notion.service';

@Module({
  providers: [ConfigService, NotionService],
})
export class NotionModule {}
