import { Repository } from 'typeorm';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { User } from './user.entity';
import { Role } from '../auth/enums/role.enum';
import { UsersService } from './users.service';
import { UserRegisterInput } from 'src/auth/dto/user-register.input';

describe('UsersService', () => {
  let module: TestingModule;
  let usersService: UsersService;
  let usersRepository: Repository<User>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
      ],
    }).compile();

    usersService = await module.get<UsersService>(UsersService);
    usersRepository = await module.get<Repository<User>>(
      getRepositoryToken(User),
    );
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
});
