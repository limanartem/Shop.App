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

jest.mock('supertokens-node/framework/express', () => {
  return {
    errorHandler: jest.fn(() => (err: any, __: any, ___: any, next: NextFunction) => {
      console.error(err);

      return next();
    }),
    middleware: jest.fn(() => () => {}),
  };
});

export {};
