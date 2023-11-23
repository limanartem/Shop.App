import { compilerOptions } from '../../tsconfig.json';
import type { Config } from '@jest/types';
import { pathsToModuleNameMapper } from 'ts-jest';

const config: Config.InitialOptions = {
  // setupFiles: ['<rootDir>/src/.jest/setEnvVars.js'],
  // setupFilesAfterEnv: ['<rootDir>/src/.jest/test-setup.js'],
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    // process `*.tsx` files with `ts-jest`
  },
  // collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  detectOpenHandles: true,
  verbose: true,
  passWithNoTests: true,
  roots: ['src/'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      // This has to match the baseUrl defined in tsconfig.json.
      prefix: '<rootDir>/../../',
    }),
  },
  // runner: 'groups',
};

export default config;
