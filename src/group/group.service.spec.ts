import { EntityNotFoundError, Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Group } from './group.entity';
import { GroupService } from './group.service';

import { CreateGroupInput } from './dto/create-group.input';
import { UpdateGroupInput } from './dto/update-group.input';

describe('GroupService', () => {
  let service: GroupService;
  let groupRepository: Repository<Group>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        {
          provide: getRepositoryToken(Group),
          useValue: Repository,
        },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
    groupRepository = module.get<Repository<Group>>(getRepositoryToken(Group));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGroups', () => {
    it(`returns all groups`, async () => {
      groupRepository.find = jest.fn();

      await service.getGroups();

      expect(groupRepository.find).toBeCalled();
    });
  });

  describe('getGroupByID', () => {
    it(`returns group by ID`, async () => {
      groupRepository.findOne = jest.fn();

      await service.getGroupByID(1);

      expect(groupRepository.findOne).toBeCalledWith({ id: 1 });
    });
  });

  describe('createGroup', () => {
    it(`creates a new group & returns it`, async () => {
      const createGroupInput: CreateGroupInput = {
        grade: 11,
        notes: 'notes',
        scheduleDay: 1,
        scheduleHour: 12,
        scheduleMinute: 30,
      };
      groupRepository.save = jest.fn().mockReturnValue({
        id: 1,
        ...createGroupInput,
      });

      const res = await service.createGroup(createGroupInput);

      expect(res).toStrictEqual({
        id: 1,
        ...createGroupInput,
      });
      expect(groupRepository.save).toBeCalledWith(createGroupInput);
    });
  });

  describe('updateGroup', () => {
    it(`updates an existing group`, async () => {
      const updateGroupInput: UpdateGroupInput = {
        id: 1,
        grade: 11,
        notes: 'notes',
        scheduleDay: 1,
        scheduleHour: 12,
        scheduleMinute: 30,
      };
      groupRepository.findOneOrFail = jest.fn().mockReturnValue({
        ...updateGroupInput,
      });
      groupRepository.save = jest.fn();

      await service.updateGroup(updateGroupInput);

      expect(groupRepository.findOneOrFail).toBeCalledWith(1);
      expect(groupRepository.save).toBeCalledWith(updateGroupInput);
    });

    it(`throws error if group doesn't exist`, async () => {
      const updateGroupInput: UpdateGroupInput = {
        id: 1,
        grade: 11,
        notes: 'notes',
        scheduleDay: 1,
        scheduleHour: 12,
        scheduleMinute: 30,
      };
      groupRepository.findOneOrFail = jest.fn(async () => {
        throw new EntityNotFoundError(Group, '');
      });

      expect(service.updateGroup(updateGroupInput)).rejects.toThrowError(
        EntityNotFoundError,
      );
    });
  });

  describe('deleteGroup', () => {
    it(`returns true if group was successfully deleted`, async () => {
      const group: Group = {
        id: 1,
        notes: '',
        grade: 11,
        scheduleDay: 2,
        scheduleHour: 12,
        scheduleMinute: 45,
      };
      groupRepository.findOne = jest.fn(async () => group);
      groupRepository.delete = jest.fn();

      const res = await service.deleteGroup(1);

      expect(res).toBeTruthy();
      expect(groupRepository.delete).toBeCalledWith(group);
    });

    it(`returns false if group to be deleted doesn't exist`, async () => {
      groupRepository.findOne = jest.fn(async () => undefined);

      const res = await service.deleteGroup(1);

      expect(res).toBeFalsy();
    });
  });
});
