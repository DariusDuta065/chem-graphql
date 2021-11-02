import { EntityNotFoundError, TypeORMError } from 'typeorm';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import {
  Catch,
  Logger,
  ArgumentsHost,
  NotFoundException,
} from '@nestjs/common';

@Catch(TypeORMError)
export class TypeORMExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(TypeORMExceptionFilter.name);

  catch(exception: TypeORMError, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);

    if (exception instanceof EntityNotFoundError) {
      this.logger.error(exception);
      throw new NotFoundException(exception.message);
    }

    this.logger.error(exception);
    return exception;
  }
}
