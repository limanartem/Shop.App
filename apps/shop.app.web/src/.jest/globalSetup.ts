// Suppress console.log in tests
jest.spyOn(console, 'log').mockImplementation(() => {});

export {};
