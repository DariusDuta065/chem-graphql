import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Group } from './group.entity';
import { User } from 'src/user/user.entity';
import { Content } from 'src/content/content.entity';

import { GroupService } from './group.service';
import { GroupResolver } from './group.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Group, User, Content])],
  providers: [GroupService, GroupResolver],
  exports: [GroupService],
})
export class GroupModule {}
