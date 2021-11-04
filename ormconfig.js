const { readFileSync } = require('fs');
const yaml = require('js-yaml');
const { join } = require('path');
const { SnakeNamingStrategy } = require('typeorm-naming-strategies');

require('dotenv').config({ path: `env/${process.env.NODE_ENV}.env` });

const YAML_CONFIG_FILENAME = `src/config/files/config.${process.env.NODE_ENV}.yaml`;
const config = yaml.load(readFileSync(join(__dirname, YAML_CONFIG_FILENAME), 'utf8'));

module.exports = {
  ...config.db.typeorm,
  namingStrategy: new SnakeNamingStrategy(),
};
