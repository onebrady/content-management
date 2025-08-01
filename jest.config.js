const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock problematic ES modules
    '^jose$': '<rootDir>/src/__mocks__/jose.js',
    '^openid-client$': '<rootDir>/src/__mocks__/openid-client.js',
    '^@panva/hkdf$': '<rootDir>/src/__mocks__/hkdf.js',
    '^preact-render-to-string$':
      '<rootDir>/src/__mocks__/preact-render-to-string.js',
    '^preact$': '<rootDir>/src/__mocks__/preact.js',
    '^@auth/prisma-adapter$': '<rootDir>/src/__mocks__/@auth/prisma-adapter.js',
    // Mock Next.js and NextAuth.js server utilities
    '^next-auth$': '<rootDir>/src/__mocks__/next-auth.js',
    '^next-auth/next$': '<rootDir>/src/__mocks__/next-auth.js',
    '^next$': '<rootDir>/src/__mocks__/next.js',
    '^next/server$': '<rootDir>/src/__mocks__/next.js',
  },
  transformIgnorePatterns: ['node_modules/(?!(next-auth|@next-auth)/)'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/_*.{js,jsx,ts,tsx}',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/pages/_*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
  ],
  // Set up coverage thresholds (temporarily lowered to allow for incremental improvement)
  coverageThreshold: {
    global: {
      branches: 5,
      functions: 5,
      lines: 10,
      statements: 10,
    },
  },
  // Exclude e2e tests from Jest runs
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/e2e/',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
