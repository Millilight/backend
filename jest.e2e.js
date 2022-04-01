const baseConfig = require('./jest.config');

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  ...baseConfig,
  testMatch: ['<rootDir>/__tests__/**/*.e2e-spec.ts'],
};
