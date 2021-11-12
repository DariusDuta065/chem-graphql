import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Group } from './group.entity';
import { CreateGroupInput } from './dto/create-group.input';
import { UpdateGroupInput } from './dto/update-group.input';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group) private groupRepository: Repository<Group>,
  ) {}

  public async getGroups(): Promise<Group[]> {
    return this.groupRepository.find();
  }

  public async getGroupByID(groupID: number): Promise<Group | undefined> {
    return this.groupRepository.findOne({ id: groupID });
  }

  public async createGroup(input: CreateGroupInput): Promise<Group> {
    const group = new Group();
    group.grade = input.grade;
    group.notes = input.notes;
    group.scheduleDay = input.scheduleDay;
    group.scheduleHour = input.scheduleHour;
    group.scheduleMinute = input.scheduleMinute;

    return this.groupRepository.save(group);
  }

  public async updateGroup(input: UpdateGroupInput): Promise<Group> {
    const group = await this.groupRepository.findOneOrFail(input.id);

    group.grade = input.grade;
    group.notes = input.notes;
    group.scheduleDay = input.scheduleDay;
    group.scheduleHour = input.scheduleHour;
    group.scheduleMinute = input.scheduleMinute;

    return this.groupRepository.save(group);
  }

  public async deleteGroup(groupID: number): Promise<boolean> {
    const group = await this.groupRepository.findOne(groupID);

    if (!group) {
      return false;
    }

    await this.groupRepository.delete(group);
    return true;
  }
}
