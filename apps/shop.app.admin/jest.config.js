/**
 * Jest configuration for Shop.App admin
 * This is a minimal configuration that works with Create React App
 */
module.exports = {
  // Use CRA's built-in configuration
  preset: 'react-scripts',
  // Default test roots
  roots: ['<rootDir>/src'],
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironment: 'jsdom',
  watchPlugins: [], // Empty array to disable watch plugins
};
