import * as fs from 'fs';
import * as jsyaml from 'js-yaml';
import { join } from 'path';

import * as configuration from './configuration';

describe('configuration', () => {
  it.each`
    envType
    ${'test'}
    ${'dev'}
    ${'production'}
  `(
    `should be defined for $envType env`,
    ({ envType }: { envType: string }) => {
      process.env.NODE_ENV = envType;

      const fileName = join(__dirname, `../../env.yaml`);
      const readFileSyncMock = jest.fn(() => `${envType} config`);

      const loadMock = jest.fn((configString: string) => `${configString} obj`);

      jest.spyOn(fs, 'readFileSync').mockImplementation(readFileSyncMock);
      jest.spyOn(jsyaml, 'load').mockImplementation(loadMock);

      const res = configuration.default();

      expect(readFileSyncMock).toBeCalledWith(fileName, 'utf8');
      expect(loadMock).toBeCalledWith(`${envType} config`);

      expect(res).toStrictEqual(`${envType} config obj`);
    },
  );

  it(`should throw an error if NODE_ENV is not defined`, () => {
    process.env.NODE_ENV = '';

    try {
      configuration.default();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('NODE_ENV is not defined');
    }
  });

  it(`should throw an error if NODE_ENV is not ['test', 'dev', 'production']`, () => {
    process.env.NODE_ENV = 'another';

    try {
      configuration.default();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('NODE_ENV value is not accepted');
    }
  });
});
