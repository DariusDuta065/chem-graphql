import type { Config } from '@jest/types';
import { pathsToModuleNameMapper } from 'ts-jest/utils';

const compilerOptions = {
  paths: {},
};

export default async (): Promise<Config.InitialOptions> => {
  return {
    rootDir: '.',
    maxWorkers: 1,

    testEnvironment: 'node',
    testRegex: '.*\\.(e2e-)?spec\\.ts',
    transform: {
      '^.+\\.(t)s$': 'ts-jest',
    },

    moduleDirectories: ['node_modules'],
    moduleNameMapper: {
      ...pathsToModuleNameMapper(compilerOptions.paths, {
        prefix: '<rootDir>/',
      }),
      '^src/(.*)$': '<rootDir>/src/$1',
    },
    moduleFileExtensions: ['js', 'json', 'ts'],

    collectCoverageFrom: [
      'src/**/*.(t|j)s',
      '!**/*rc.(t|j)s',
      '!**/main.(t|j)s',
      '!**/cli.(t|j)s',
      '!**/dist/**',
      '!**/node_modules/**',
      '!**/*.module.(t|j)s',
      '!**/migrations/*.(t|j)s',
      '!**/db/**',
    ],
    coverageDirectory: './coverage',
  };
};
