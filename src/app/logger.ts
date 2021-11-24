import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as Transport from 'winston-transport';
import { LoggerService } from '@nestjs/common';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';

const setupLogger = (): LoggerService => {
  const transports: Transport[] = [];

  switch (process.env.NODE_ENV) {
    case 'production':
      // Production environment

      transports.push(
        new winston.transports.DailyRotateFile({
          filename: 'graphql-%DATE%.log',
          datePattern: 'YYYY-MM-DD-HH',
          zippedArchive: false,
          maxSize: '20m',
          maxFiles: '7d',
        }),
      );
      break;
    default:
      // Non-prod environments

      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('GraphQL', {
              prettyPrint: true,
            }),
          ),
        }),
        new winston.transports.File({ filename: 'error.log', level: 'warn' }),
        new winston.transports.File({ filename: 'combined.log' }),
      );
      break;
  }

  return WinstonModule.createLogger({
    level: 'debug',
    defaultMeta: {},
    transports,
  });
};

export default setupLogger;
