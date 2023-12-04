export const mockImpl = (target: any, mock: (...args: any) => {}) => {
  (target as jest.Mock).mockImplementation(mock);
};

/* Below does not work at runtime


declare global {
  interface Function {
    mockImpl(callback: (...args: any) => {}): void;
  }
}

Function.prototype.mockImpl = (callback: (...args: any) => {}) => {
  mockImpl(this, callback);
};

export {};
 */