import { EntityNotFoundError, Repository } from 'typeorm';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { User } from './user.entity';
import { Role } from '../auth/enums/role.enum';
import { UserService } from './user.service';
import { UserRegisterInput } from 'src/auth/dto/user-register.input';

describe('UserService', () => {
  let module: TestingModule;
  let usersService: UserService;
  let usersRepository: Repository<User>;

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

    usersService = module.get<UserService>(UserService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    await module.close();
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

      usersService.findOneByEmail = jest.fn().mockReturnValue(undefined);
      usersRepository.save = jest.fn().mockImplementation(async (user) => user);

      const res = await usersService.registerUser(
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

      usersService.findOneByEmail = jest.fn().mockReturnValue(undefined);
      usersRepository.save = jest.fn().mockImplementation(async (user) => user);

      await usersService.registerUser(
        userRegisterInput,
        cleartextPass,
        hashedPass,
      );

      expect(usersRepository.save).toBeCalledWith({
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

      usersService.findOneByEmail = jest.fn().mockReturnValue({
        userId: 1,
        password: 'hashed password',
        ...userRegisterInput,
      });

      expect(
        usersService.registerUser(userRegisterInput, cleartextPass, hashedPass),
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
      usersRepository.findOneOrFail = jest.fn(async () => user);
      usersRepository.save = jest.fn();

      await usersService.updateUserPassword(user.userId, 'new password');

      expect(usersRepository.findOneOrFail).toBeCalledWith(user.userId);
      expect(usersRepository.save).toBeCalledWith({
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
      usersRepository.findOneOrFail = jest.fn(async () => {
        throw new EntityNotFoundError({ type: User, name: User.name }, '');
      });
      usersRepository.save = jest.fn();

      expect(
        usersService.updateUserPassword(user.userId, 'new password'),
      ).rejects.toThrowError(EntityNotFoundError);
    });
  });
});
