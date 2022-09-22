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

      const res = configuration.default();

      expect(res).toBeInstanceOf(Object);
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
