import { ArgumentsHost, Logger, NotFoundException } from '@nestjs/common';
import { EntityNotFoundError, TypeORMError } from 'typeorm';

import { User } from '../../users/user.entity';
import { TypeORMExceptionFilter } from './typeorm-filter';

describe('TypeORMExceptionFilter', () => {
  let excFilter: TypeORMExceptionFilter;

  beforeAll(() => {
    excFilter = new TypeORMExceptionFilter();
  });

  it(`catches TypeORMError's`, () => {
    const err = new TypeORMError('mock typeorm error');

    const mockError = jest.fn();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(mockError);

    const res = excFilter.catch(err, {} as ArgumentsHost);

    expect(res).toBe(err);
    expect(mockError).toBeCalledWith(err);
  });

  it(`converts EntityNotFoundError into NotFoundException`, () => {
    const err = new EntityNotFoundError({ name: User.name, type: User }, '');
    const mockError = jest.fn();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(mockError);

    const res = excFilter.catch(err, {} as ArgumentsHost);

    expect(res).toBeInstanceOf(NotFoundException);
    expect(res.message).toBe(err.message);
    expect(mockError).toBeCalledWith(err);
  });
});
