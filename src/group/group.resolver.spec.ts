import { Test, TestingModule } from '@nestjs/testing';

import { GroupResolver } from './group.resolver';
import { GroupService } from './group.service';

import { CreateGroupInput } from './dto/create-group.input';
import { UpdateGroupInput } from './dto/update-group.input';

describe('GroupResolver', () => {
  let resolver: GroupResolver;
  let groupService: GroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupResolver,
        {
          provide: GroupService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<GroupResolver>(GroupResolver);
    groupService = module.get<GroupService>(GroupService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('groups', () => {
    it(`returns a list of all groups`, async () => {
      groupService.getGroups = jest.fn();

      await resolver.groups();

      expect(groupService.getGroups).toBeCalled();
    });
  });

  describe('group', () => {
    it(`returns a particular group by its ID`, async () => {
      const groupID = 1;
      groupService.getGroupByID = jest.fn();

      await resolver.group(groupID);

      expect(groupService.getGroupByID).toBeCalledWith(groupID);
    });
  });

  describe('createGroup', () => {
    it(`creates a new group`, async () => {
      const createGroupInput: CreateGroupInput = {
        grade: 11,
        notes: 'notes',
        scheduleDay: 1,
        scheduleHour: 14,
        scheduleMinute: 15,
      };
      groupService.createGroup = jest.fn();

      await resolver.createGroup(createGroupInput);

      expect(groupService.createGroup).toBeCalledWith(createGroupInput);
    });
  });

  describe('updateGroup', () => {
    it(`updates existing group`, async () => {
      const updateGroupInput: UpdateGroupInput = {
        id: 245,
        grade: 11,
        notes: 'notes',
        scheduleDay: 1,
        scheduleHour: 14,
        scheduleMinute: 15,
      };
      groupService.updateGroup = jest.fn();

      await resolver.updateGroup(updateGroupInput);

      expect(groupService.updateGroup).toBeCalledWith(updateGroupInput);
    });
  });

  describe('deleteGroup', () => {
    it(`deletes existing group`, async () => {
      const groupID = 3;
      groupService.deleteGroup = jest.fn();

      await resolver.deleteGroup(groupID);

      expect(groupService.deleteGroup).toBeCalledWith(groupID);
    });
  });
});
