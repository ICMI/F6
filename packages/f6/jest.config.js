module.exports = {
  runner: 'jest-electron/runner',
  testEnvironment: 'jest-electron/environment',
  preset: 'ts-jest',
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.{ts,js}', '!**/node_modules/**', '!**/vendor/**'],
  testRegex: '/tests/.*-spec\\.ts?$',
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!@mapbox)'],
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      isolatedModules: true,
      tsConfig: {
        allowJs: true,
        target: 'ES2019',
      },
    },
  },
};
