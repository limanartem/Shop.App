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
jest.mock('../express/graphql-ws-server');
jest.mock('../express/csrf', () => ({
  csrfMiddleware: jest.fn((_: any, __: any, next: NextFunction) => {
    return next();
  }),
  routerFactory: jest.fn(() => (_: any, __: any, next: NextFunction) => {
    return next();
  }),
}));

jest.mock('../utils/amqp');

export {};
