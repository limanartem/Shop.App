export const delay = (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
};

export const mockImpl = (target: any, mock: (...args: any) => {}) => {
  (target as jest.Mock).mockImplementation(mock);
};

export const mockResolved = (target: any, value: any) => {
  (target as jest.Mock).mockResolvedValue(value);
};
