// jest.config.js
module.exports = {
  roots: ['<rootDir>'],
  testMatch: ['**/?(*.)+(e2e-spec).ts'],
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],

  transform: {
    '^.+\\.[tj]s$': ['ts-jest', {useESM: true}],
  },

  // ⚡️ Cho phép Jest transform các module ESM cần thiết (axios, alchemy-sdk, rootfi-api)
  transformIgnorePatterns: [
    'node_modules/(?!(axios|alchemy-sdk|rootfi-api)/)',
  ],

  // ⚡️ Ép Jest luôn dùng build CommonJS của axios
  moduleNameMapper: {
    '^axios$': '<rootDir>/node_modules/axios/index.js'
  },

  setupFiles: ['<rootDir>/test/jest.setup.ts'],

  globals: {
    'ts-jest': {
      diagnostics: false,
      isolatedModules: true,
    },
  },
};
