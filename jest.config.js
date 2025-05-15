module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  // Use more direct modulePathIgnorePatterns to avoid collisions
  modulePathIgnorePatterns: ['<rootDir>/.next'],
  testTimeout: 10000, // Increase timeout to 10 seconds for tests that might need more time
  watchPathIgnorePatterns: ['<rootDir>/.next/']
};