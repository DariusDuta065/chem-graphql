import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Group } from './group.entity';
import { GroupService } from './group.service';
import { GroupResolver } from './group.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Group])],
  providers: [GroupService, GroupResolver],
  exports: [GroupService],
})
export class GroupModule {}
