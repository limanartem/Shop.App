import '@testing-library/jest-dom';
import { render, screen, cleanup } from '@testing-library/react';
import Orders from '.';
import { Provider } from 'react-redux';
import { buildStore } from '../../app/store';

jest.mock('../../services/order-service', () => ({
  getOrdersAsync: jest.fn(() => Promise.resolve({orders: []}))
}));

// Avoid loading store from the local storage
jest.mock('../../app/persistance/local-storage');

describe('Feature Orders', () => {
  let store: ReturnType<typeof buildStore>;

  beforeEach(async () => {
    store = buildStore();
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('should contain main elements', async () => {
    render(
      <Provider store={store}>
        <Orders />
      </Provider>,
    );
    await expect(await screen.findByTestId('feature-orders')).toBeInTheDocument();
  });
});
