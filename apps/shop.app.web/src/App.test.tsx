import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, cleanup, within } from '@testing-library/react';
import App from './App';
import { SessionAuth } from 'supertokens-auth-react/recipe/session';

jest.mock('supertokens-auth-react/recipe/session', () => ({
  SessionAuth: jest.fn(),
}));
jest.mock('./components/AuthWrapper', () => ({
  AuthWrapper: ({
    children,
    onAuthInitialized,
  }: {
    children: React.ReactNode;
    onAuthInitialized: () => void;
  }) => {
    return <>{children}</>;
  },
}));

jest.mock('./services/catalog-service', () => ({
  getProductsAsync: jest.fn().mockResolvedValue([]),
  getCategoriesAsync: jest.fn().mockResolvedValue([]),
}));

jest.mock('./services/order-service', () => ({
  getOrdersAsync: jest.fn().mockResolvedValue({ orders: [] }),
  createOrdersAsync: jest.fn().mockResolvedValue(null),
}));

describe('<App />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('should contain main elements', async () => {
    render(<App />);
    await expect(await screen.findByTestId('appBar')).toBeInTheDocument();
    await expect(await screen.findByTestId('categoriesTree')).toBeInTheDocument();
  });

  it('should navigate to catalog feature', async () => {
    window.history.pushState({}, '', '/catalog');
    render(<App />);
    await expect(await screen.findByTestId('feature-catalog')).toBeInTheDocument();
  });

  describe('for unauthenticated user', () => {
    beforeEach(() => {
      // Mock user is not authenticated
      (SessionAuth as jest.Mock).mockImplementation(
        ({ children }: { children?: React.ReactNode }) => <></>,
      );
    });

    it('should not navigate to checkout feature if user is not authenticated', async () => {
      window.history.pushState({}, '', '/checkout');
      render(<App />);
      await expect(screen.findByTestId('feature-checkout')).rejects.toThrow();
    });

    it('should not navigate to orders feature if user is not authenticated', async () => {
      window.history.pushState({}, '', '/orders');
      render(<App />);
      await expect(screen.findByTestId('feature-orders')).rejects.toThrow();
    });
  });

  describe('for authenticated user', () => {
    beforeEach(() => {
      // Mock user is authenticated
      (SessionAuth as jest.Mock).mockImplementation(
        ({ children }: { children?: React.ReactNode }) => <>{children}</>,
      );
    });

    it('should navigate to checkout feature', async () => {
      window.history.pushState({}, '', '/checkout');
      render(<App />);
      await expect(await screen.findByTestId('feature-checkout')).toBeInTheDocument();
    });

    it('should navigate to orders feature', async () => {
      window.history.pushState({}, '', '/orders');
      render(<App />);
      await expect(await screen.findByTestId('feature-orders')).toBeInTheDocument();
    });
  });

  it('should contain search within appBar', async () => {
    render(<App />);
    const appBarElement = await screen.findByTestId('appBar');
    const search = await within(appBarElement).findByTestId('appBar-search');
    expect(search).toBeInTheDocument();
  });
});