import type { Config } from 'jest';

const config: Config = {
  roots: ['<rootDir>'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          module: 'commonjs',
          moduleResolution: 'node',
          esModuleInterop: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/__tests__/**/*.test.tsx', '**/__tests__/**/*.test.ts'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};

export default config;
