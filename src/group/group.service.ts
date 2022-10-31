import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Group } from './group.entity';
import { User } from 'src/user/user.entity';
import { Role } from 'src/auth/enums/role.enum';
import { Content } from 'src/content/content.entity';

import { CreateGroupInput } from './dto/create-group.input';
import { UpdateGroupInput } from './dto/update-group.input';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Group) private groupRepository: Repository<Group>,
    @InjectRepository(Content) private contentRepository: Repository<Content>,
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

    if (input.users) {
      const users: User[] = await this.getUsersFromArray(input.users);
      group.users = Promise.resolve(users);
    }

    if (input.contents) {
      const contents: Content[] = await this.getContentsFromArray(
        input.contents,
      );

      const tmp = input.contents
        .map((cID) => contents.find((c) => c.id === cID))
        .filter((c): c is Content => !!c);

      group.contents = Promise.resolve([]);
      await this.groupRepository.save(group);
      group.contents = Promise.resolve(tmp);
    }

    return this.groupRepository.save(group);
  }

  public async deleteGroup(groupID: number): Promise<boolean> {
    const group = await this.groupRepository.findOne(groupID);

    if (!group) {
      return false;
    }

    group.contents = Promise.resolve([]);
    group.users = Promise.resolve([]);
    await this.groupRepository.save(group);

    await this.groupRepository.delete({ id: groupID });
    return true;
  }

  private async getUsersFromArray(users: number[]): Promise<User[]> {
    return await this.userRepository.findByIds(users, {
      where: {
        role: Role.User,
      },
    });
  }

  private async getContentsFromArray(contents: number[]): Promise<Content[]> {
    return await this.contentRepository.findByIds(contents);
  }
}
