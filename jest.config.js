/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/seed/**',
    '!src/server.js',   // server startup excluded; tested via supertest app export
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  // Give tests enough time to open MongoDB connections
  testTimeout: 20000,
  // Run tests sequentially to avoid port conflicts
  maxWorkers: 1,
  // Setup / teardown
  globalSetup: './tests/setup/globalSetup.js',
  globalTeardown: './tests/setup/globalTeardown.js',
};
