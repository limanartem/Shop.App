const mockImplementation = (target: any, mock: (...args: any) => {}) => {
  (target as jest.Mock).mockImplementation(mock);
};

declare global {
  interface Function {
    mockImplementation(callback: (...args: any) => {}): void;
  }
}

Function.prototype.mockImplementation = (callback: (...args: any) => {}) => {
  mockImplementation(this, callback);
};

export {};
