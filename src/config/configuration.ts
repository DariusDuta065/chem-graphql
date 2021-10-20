import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

const YAML_CONFIG_FILENAME = `config.${process.env.NODE_ENV ?? 'dev'}.yaml`;

export default () => {
  const parsedConfig = yaml.load(
    readFileSync(join(__dirname, YAML_CONFIG_FILENAME), 'utf8'),
  ) as Record<string, any>;

  return parsedConfig;
};
