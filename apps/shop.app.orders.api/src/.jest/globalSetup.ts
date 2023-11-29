// Suppress console.log in tests
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.mock('@shop.app/lib.express/dist', () => ({
  useTracing: jest.fn(),
  useLogging: jest.fn(),
}));

export {};
