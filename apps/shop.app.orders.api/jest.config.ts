export const preset = 'ts-jest';
export const coverageThreshold = {
  global: {
    branches: 85,
    functions: 90,
    lines: 90,
    statements: 90,
  },
};
export const detectOpenHandles = true;
export const verbose = true;
export const passWithNoTests = true;
export const roots = ['src/'];
export const setupFiles = ['<rootDir>/src/.jest/globalSetup.ts'];
