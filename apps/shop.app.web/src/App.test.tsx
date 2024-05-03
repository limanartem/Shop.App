import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, cleanup, within } from '@testing-library/react';
import App from './App';
import { SessionAuth } from 'supertokens-auth-react/recipe/session';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './app/store';

jest.mock('supertokens-auth-react/recipe/session', () => ({
  SessionAuth: jest.fn(),
}));
jest.mock('./components/AuthWrapper', () => ({
  AuthWrapper: ({ children }: { children: React.ReactNode; onAuthInitialized: () => void }) => {
    return <>{children}</>;
  },
}));

jest.mock('./services', () => ({
  catalogServiceClient: {
    getProductsAsync: jest.fn().mockResolvedValue([]),
    getCategoriesAsync: jest.fn().mockResolvedValue([]),
  },
  orderServiceClient: {
    getOrdersAsync: jest.fn().mockResolvedValue({ orders: [] }),
    getOrderAsync: jest.fn().mockResolvedValue({}),
    createOrdersAsync: jest.fn().mockResolvedValue(null),
  },
}));

describe('App', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('should contain main elements', async () => {
    renderApp();
    await expect(await screen.findByTestId('appBar')).toBeInTheDocument();
    await expect(await screen.findByTestId('categoriesTree')).toBeInTheDocument();
  });

  it('should navigate to catalog feature', async () => {
    window.history.pushState({}, '', '/catalog');
    renderApp();
    await expect(await screen.findByTestId('feature-catalog')).toBeInTheDocument();
  });

  describe('unauthenticated user', () => {
    beforeEach(() => {
      // Mock user is not authenticated
      (SessionAuth as jest.Mock).mockImplementation(() => <></>);
    });

    it('should not navigate to checkout feature if user is not authenticated', async () => {
      window.history.pushState({}, '', '/checkout');
      renderApp();
      await expect(screen.findByTestId('feature-checkout')).rejects.toThrow();
    });

    it('should not navigate to orders feature if user is not authenticated', async () => {
      window.history.pushState({}, '', '/orders');
      renderApp();
      await expect(screen.findByTestId('feature-orders')).rejects.toThrow();
    });

    it('should not navigate to order page feature if user is not authenticated', async () => {
      window.history.pushState({}, '', '/orders/123445');
      renderApp();
      await expect(screen.findByTestId('feature-orderPage')).rejects.toThrow();
    });
  });

  describe('authenticated user', () => {
    beforeEach(() => {
      // Mock user is authenticated
      (SessionAuth as jest.Mock).mockImplementation(
        ({ children }: { children?: React.ReactNode }) => <>{children}</>,
      );
    });

    it('able to navigate to checkout feature', async () => {
      window.history.pushState({}, '', '/checkout');
      renderApp();
      await expect(await screen.findByTestId('feature-checkout')).toBeInTheDocument();
    });

    it('able to navigate to orders feature', async () => {
      window.history.pushState({}, '', '/orders');
      renderApp();
      await expect(await screen.findByTestId('feature-orders')).toBeInTheDocument();
    });

    it('able to navigate to order page feature', async () => {
      window.history.pushState({}, '', '/orders/1234');
      renderApp();
      await expect(await screen.findByTestId('feature-orderPage')).toBeInTheDocument();
    });
  });

  it('should contain search within appBar', async () => {
    renderApp();
    const appBarElement = await screen.findByTestId('appBar');
    const search = await within(appBarElement).findByTestId('appBar-search');
    expect(search).toBeInTheDocument();
  });
});
function renderApp() {
  render(
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>,
  );
}
