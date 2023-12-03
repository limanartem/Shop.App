const mockImplementation = (target: any, mock: (...args: any) => {}) => {
  (target as jest.Mock).mockImpl(mock);
};

declare global {
  interface Function {
    mockImpl(callback: (...args: any) => {}): void;
  }
}

Function.prototype.mockImpl = (callback: (...args: any) => {}) => {
  mockImplementation(this, callback);
};

export {};
