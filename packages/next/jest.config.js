module.exports = {
  runner: 'jest-electron/runner',
  testEnvironment: 'jest-electron/environment',
  preset: 'ts-jest',
  collectCoverage: false,
  collectCoverageFrom: ['packages/*/src/**/*.{ts,tsx,js}', '!**/node_modules/**'],
  modulePathIgnorePatterns: ['packages/*/dist'],
  testPathIgnorePatterns: [],
  testRegex: '/tests/.*\\-spec\\.tsx?$',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
};
