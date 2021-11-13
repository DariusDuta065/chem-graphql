import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserInput } from './dto/update-user.input';

import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: UserService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('users', () => {
    it(`returns a list of all users`, async () => {
      userService.getUsers = jest.fn();

      await resolver.users();

      expect(userService.getUsers).toBeCalled();
    });
  });

  describe('user', () => {
    it(`returns a particular user by its ID`, async () => {
      const userID = 1;
      userService.getUserByID = jest.fn();

      await resolver.user(userID);

      expect(userService.getUserByID).toBeCalledWith(userID);
    });
  });

  describe('updateUser', () => {
    it(`updates existing user`, async () => {
      const updateUserInput: UpdateUserInput = {
        id: 1,
        firstName: 'new first name',
        lastName: 'new last name',
        email: 'newEmail@test.com',
      };
      userService.updateUser = jest.fn();

      await resolver.updateUser(updateUserInput);

      expect(userService.updateUser).toBeCalledWith(updateUserInput);
    });
  });

  describe('deleteUser', () => {
    it(`deletes existing user`, async () => {
      const userID = 3;
      userService.deleteUser = jest.fn();

      await resolver.deleteUser(userID);

      expect(userService.deleteUser).toBeCalledWith(userID);
    });
  });
});
