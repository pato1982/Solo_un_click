module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  globalSetup: './__tests__/setup.js',
  globalTeardown: './__tests__/teardown.js',
  testTimeout: 15000,
  verbose: true,
}
