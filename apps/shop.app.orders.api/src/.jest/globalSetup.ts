import { NextFunction } from 'express';

// Suppress console.log in tests
const { SUPPRESS_JEST_LOG = 'true' } = process.env;

if (SUPPRESS_JEST_LOG === 'true') {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
}

jest.mock('@shop.app/lib.express/dist', () => ({
  useTracing: jest.fn(),
  useLogging: jest.fn(),
}));

jest.mock('graphql-playground-middleware-express', () => () => () => {});
jest.mock('../express/ws-server');

export {};
