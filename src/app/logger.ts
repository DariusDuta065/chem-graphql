import * as winston from 'winston';
import * as Transport from 'winston-transport';
import { LoggerService } from '@nestjs/common';
import * as WinstonCloudWatch from 'winston-cloudwatch';
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
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('GraphQL', {
              prettyPrint: true,
            }),
          ),
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

  transports.push(
    new WinstonCloudWatch({
      logGroupName: 'GraphQL',
      logStreamName: (): string => {
        const date = new Date().toISOString().split('T')[0];
        const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

        return `${env}-${date}`;
      },
      awsRegion: 'eu-west-2',
      level: 'debug',
    }),
  );

  return WinstonModule.createLogger({
    level: 'debug',
    defaultMeta: {},
    transports,
  });
};

export default setupLogger;
