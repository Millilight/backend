const baseConfig = require('./jest.config');

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  ...baseConfig,
  testMatch: ['<rootDir>/__tests__/**/*.e2e-spec.ts'],
  rootDir: '.',
  moduleNameMapper: {
    '@/utils/(.*)': '<rootDir>/src/common/utils/$1',
    '@gqltypes': '<rootDir>/src/graphql',
    '@parsers': '<rootDir>/src/common/utils/parsers',
  },
};
