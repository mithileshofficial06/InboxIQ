/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  clearMocks: true,
  restoreMocks: true,
  // These are pure unit tests with no shared external resources, so parallel
  // workers buy nothing — each one re-pays the ts-jest compile cost, making the
  // suite ~3x slower, and worker teardown intermittently logs a spurious
  // "failed to exit gracefully" warning on Windows.
  maxWorkers: 1,
};
