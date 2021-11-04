import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

export default () => {
  const YAML_CONFIG_FILENAME = `files/config.${process.env.NODE_ENV}.yaml`;

  if (!process.env.NODE_ENV) {
    throw new Error('NODE_ENV is not defined');
  }

  if (!['test', 'dev', 'production'].includes(process.env.NODE_ENV)) {
    throw new Error('NODE_ENV value is not accepted');
  }

  const parsedConfig = yaml.load(
    readFileSync(join(__dirname, YAML_CONFIG_FILENAME), 'utf8'),
  ) as Record<string, any>;

  return parsedConfig;
};
