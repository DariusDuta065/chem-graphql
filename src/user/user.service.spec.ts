import { EntityNotFoundError, Repository } from 'typeorm';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { User } from './user.entity';
import { UserService } from './user.service';
import { Role } from '../auth/enums/role.enum';

import { UpdateUserInput } from './dto/update-user.input';
import { UserRegisterInput } from '../auth/dto/user-register.input';

describe('UserService', () => {
  let module: TestingModule;
  let service: UserService;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    await module.close();
  });

  describe('getUsers', () => {
    it(`returns all users`, async () => {
      userRepository.find = jest.fn();

      await service.getUsers();

      expect(userRepository.find).toBeCalled();
    });
  });

  describe('updateUser', () => {
    it(`updates an existing user`, async () => {
      const user: User = {
        userId: 1,
        role: Role.User,
        email: 'email@test.com',
        firstName: 'first name',
        lastName: 'last name',
        password: 'hashed password',
      };

      const updateUserInput: UpdateUserInput = {
        id: 1,
        email: 'newEmail@test.com',
        firstName: 'new first name',
        lastName: 'new last name',
      };
      userRepository.findOneOrFail = jest.fn(async () => user);
      userRepository.save = jest.fn();

      await service.updateUser(updateUserInput);

      expect(userRepository.findOneOrFail).toBeCalledWith(1);
      expect(userRepository.save).toBeCalledWith({
        ...user,
        email: updateUserInput.email,
        firstName: updateUserInput.firstName,
        lastName: updateUserInput.lastName,
      });
    });

    describe('updates only the provided fields', () => {
      const user: User = {
        userId: 1,
        role: Role.User,
        email: 'email@test.com',
        firstName: 'first name',
        lastName: 'last name',
        password: 'hashed password',
      };

      it(`user's email`, async () => {
        userRepository.findOneOrFail = jest.fn(async () => user);
        userRepository.save = jest.fn();

        const updateUserInput: UpdateUserInput = {
          id: 1,
          email: 'newEmail@test.com',
        };

        await service.updateUser(updateUserInput);

        expect(userRepository.save).toBeCalledWith({
          ...user,
          email: 'newEmail@test.com',
        });
      });

      it(`user's first name`, async () => {
        userRepository.findOneOrFail = jest.fn(async () => user);
        userRepository.save = jest.fn();

        const updateUserInput: UpdateUserInput = {
          id: 1,
          firstName: 'new first name',
        };

        await service.updateUser(updateUserInput);

        expect(userRepository.save).toBeCalledWith({
          ...user,
          firstName: 'new first name',
        });
      });

      it(`user's last name`, async () => {
        userRepository.findOneOrFail = jest.fn(async () => user);
        userRepository.save = jest.fn();

        const updateUserInput: UpdateUserInput = {
          id: 1,
          lastName: 'new last name',
        };

        await service.updateUser(updateUserInput);

        expect(userRepository.save).toBeCalledWith({
          ...user,
          lastName: 'new last name',
        });
      });
    });

    it(`throws error if user doesn't exist`, async () => {
      const updateUserInput: UpdateUserInput = {
        id: 1,
        email: 'newEmail@test.com',
        firstName: 'new first name',
        lastName: 'new last name',
      };
      userRepository.findOneOrFail = jest.fn(async () => {
        throw new EntityNotFoundError(User, '');
      });

      expect(service.updateUser(updateUserInput)).rejects.toThrowError(
        EntityNotFoundError,
      );
    });
  });

  describe('deleteUser', () => {
    it(`returns true if user was successfully deleted`, async () => {
      const user: User = {
        userId: 1,
        role: Role.User,
        email: 'email@test.com',
        firstName: 'first name',
        lastName: 'last name',
        password: 'hashed password',
      };
      userRepository.findOne = jest.fn(async () => user);
      userRepository.delete = jest.fn();

      const res = await service.deleteUser(1);

      expect(res).toBeTruthy();
      expect(userRepository.delete).toBeCalledWith(user);
    });

    it(`returns false if user to be deleted doesn't exist`, async () => {
      userRepository.findOne = jest.fn(async () => undefined);

      const res = await service.deleteUser(1);

      expect(res).toBeFalsy();
    });
  });

  describe('registerUser', () => {
    it('should return the newly created user with their clear text password', async () => {
      const userRegisterInput = {
        email: 'email@test.com',
        firstName: 'first',
        lastName: 'last',
      } as UserRegisterInput;

      const cleartextPass = 'clear password';
      const hashedPass = 'hashed password';

      service.getUserByEmail = jest.fn().mockReturnValue(undefined);
      userRepository.save = jest.fn().mockImplementation(async (user) => user);

      const res = await service.registerUser(
        userRegisterInput,
        cleartextPass,
        hashedPass,
      );

      expect(res).toEqual({
        ...userRegisterInput,
        role: Role.User, // not provided in input, should default to user
        password: cleartextPass,
      });
    });

    it('should save the hashed password to the DB', async () => {
      const userRegisterInput = {
        email: 'email@test.com',
        firstName: 'first',
        lastName: 'last',
        role: Role.Admin,
      } as UserRegisterInput;

      const cleartextPass = 'clear password';
      const hashedPass = 'hashed password';

      service.getUserByEmail = jest.fn().mockReturnValue(undefined);
      userRepository.save = jest.fn().mockImplementation(async (user) => user);

      await service.registerUser(userRegisterInput, cleartextPass, hashedPass);

      expect(userRepository.save).toBeCalledWith({
        ...userRegisterInput,
        password: hashedPass,
      });
    });

    it('should throw an error if the email already exists', async () => {
      const userRegisterInput = {
        email: 'email@test.com',
        firstName: 'first',
        lastName: 'last',
        role: Role.User,
      } as UserRegisterInput;

      const cleartextPass = 'clear password';
      const hashedPass = 'hashed password';

      service.getUserByEmail = jest.fn().mockReturnValue({
        userId: 1,
        password: 'hashed password',
        ...userRegisterInput,
      });

      expect(
        service.registerUser(userRegisterInput, cleartextPass, hashedPass),
      ).rejects.toThrowError(Error);
    });
  });

  describe('updateUserPassword', () => {
    it('should save the new password for user', async () => {
      const user = {
        userId: 1,
        email: 'email@test.com',
        password: 'old password',
        firstName: 'first',
        lastName: 'last',
        role: Role.User,
      } as User;
      userRepository.findOneOrFail = jest.fn(async () => user);
      userRepository.save = jest.fn();

      await service.updateUserPassword(user.userId, 'new password');

      expect(userRepository.findOneOrFail).toBeCalledWith(user.userId);
      expect(userRepository.save).toBeCalledWith({
        ...user,
        password: 'new password',
      });
    });

    it('should throw error if userID not found', async () => {
      const user = {
        userId: 1,
        email: 'email@test.com',
        password: 'old password',
        firstName: 'first',
        lastName: 'last',
        role: Role.User,
      } as User;
      userRepository.findOneOrFail = jest.fn(async () => {
        throw new EntityNotFoundError({ type: User, name: User.name }, '');
      });
      userRepository.save = jest.fn();

      expect(
        service.updateUserPassword(user.userId, 'new password'),
      ).rejects.toThrowError(EntityNotFoundError);
    });
  });
});
