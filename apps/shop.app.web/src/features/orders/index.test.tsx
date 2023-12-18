import '@testing-library/jest-dom';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import Orders from '.';
import { Provider } from 'react-redux';
import { buildStore } from '../../app/store';
import { orderServiceClient } from '../../services';
import { randomUUID } from 'crypto';
import { setChangedOrders } from '../../app/reducers/notificationsReducer';
import { act } from 'react-dom/test-utils';
import { delay, mockResolved } from '../../test-helpers';

jest.mock('../../services', () => ({
  orderServiceClient: {
    getOrdersAsync: jest.fn(() => Promise.resolve({ orders: [] })),
  },
}));

// Avoid loading store from the local storage
jest.mock('../../app/persistance/local-storage');
jest.mock('react-router-dom');

describe('Feature Orders', () => {
  let store: ReturnType<typeof buildStore>;

  beforeEach(async () => {
    store = buildStore();
    jest.clearAllMocks();
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

  it('should fetch data from service', async () => {
    render(
      <Provider store={store}>
        <Orders />
      </Provider>,
    );
    expect(orderServiceClient.getOrdersAsync).toBeCalled();
  });

  it('should re-fetch if changed order is in the list', async () => {
    const changedOrderId = randomUUID();
    const items = [...Array(5).keys()].map((n) => ({
      product: {
        id: randomUUID(),
        title: `Product ${n + 1}`,
        description: `Product description ${n + 1}`,
        price: (n + 1) * (Math.round(Math.random() * 10000) / 100) || 1,
        currency: 'USD',
      },
      quantity: Math.round(Math.random() * 5 * (n + 1)) || 1,
    }));

    mockResolved(orderServiceClient.getOrdersAsync, {
      orders: [
        { id: changedOrderId, items },
        { id: randomUUID(), items },
      ],
    });

    render(
      <Provider store={store}>
        <Orders />
      </Provider>,
    );

    await delay(100);
    act(() => {
      store.dispatch(setChangedOrders([changedOrderId]));
    });
    await waitFor(() => expect(orderServiceClient.getOrdersAsync).toBeCalledTimes(2));
  });

  it('should not re-fetch if changed order is not in the list', async () => {
    const items = [...Array(5).keys()].map((n) => ({
      product: {
        id: randomUUID(),
        title: `Product ${n + 1}`,
        description: `Product description ${n + 1}`,
        price: (n + 1) * (Math.round(Math.random() * 10000) / 100) || 1,
        currency: 'USD',
      },
      quantity: Math.round(Math.random() * 5 * (n + 1)) || 1,
    }));

    mockResolved(orderServiceClient.getOrdersAsync, {
      orders: [
        { id: randomUUID(), items },
        { id: randomUUID(), items },
      ],
    });

    render(
      <Provider store={store}>
        <Orders />
      </Provider>,
    );

    await delay(100);
    act(() => {
      store.dispatch(setChangedOrders([randomUUID()]));
    });
    await waitFor(() => expect(orderServiceClient.getOrdersAsync).toBeCalledTimes(1));
  });
});
