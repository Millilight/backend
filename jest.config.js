module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  moduleNameMapper: {
    '@/utils/(.*)': '<rootDir>/src/common/utils/$1',
    "@gqltypes": 'src/graphql',
    "@parsers": 'src/common/utils/parsers'
  },
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverage: true,
  globals: {
    'ts-jest': {
      diagnostics: {
        ignoreCodes: ['TS151001'],
      },
      tsconfig: '<rootDir>/tsconfig.json',
      
    },
  },
};
