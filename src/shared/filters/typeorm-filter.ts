import { EntityNotFoundError, TypeORMError } from 'typeorm';
import { GqlExceptionFilter } from '@nestjs/graphql';
import {
  Catch,
  ArgumentsHost,
  Logger,
  NotFoundException,
} from '@nestjs/common';

@Catch(TypeORMError)
export class TypeORMExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(TypeORMExceptionFilter.name);

  catch(exception: TypeORMError, host: ArgumentsHost) {
    // const gqlHost = GqlArgumentsHost.create(host);

    if (exception instanceof EntityNotFoundError) {
      this.logger.error(exception);
      return new NotFoundException(exception.message);
    }

    this.logger.error(exception);
    return exception;
  }
}
