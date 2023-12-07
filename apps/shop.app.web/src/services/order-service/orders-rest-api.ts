import { CreateOrder, Order, OrdersResponse } from '../../model';
import Session from 'supertokens-auth-react/recipe/session';
import { env } from '../../config/environment';
import { OrderService } from '.';

const { REACT_APP_ORDERS_API_HOST } = env;
const apiUrl = `http://${REACT_APP_ORDERS_API_HOST}`;

const getOrdersAsync = async (): Promise<OrdersResponse> => {
  console.log(`Fetching orders from ${apiUrl}/orders`);

  const response = await fetch(`${apiUrl}/orders`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${await Session.getAccessToken()}`,
    },
  });

  if (!response.ok) {
    console.error({ status: response.status, statusText: response.statusText });
    throw new Error('Unable to get orders!');
  }

  return await response.json();
};

const getOrderAsync = async (id: string): Promise<Order | undefined> => {
  console.log(`Fetching order from ${apiUrl}/orders/${id}`);

  const response = await fetch(`${apiUrl}/orders/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${await Session.getAccessToken()}`,
    },
  });

  if (!response.ok) {
    console.error({ status: response.status, statusText: response.statusText });
    throw new Error('Unable to get order!');
  }

  return await response.json();
};

const createOrdersAsync = async (order: CreateOrder): Promise<{ id: string }> => {
  console.log(`Creation new orders using POST ${apiUrl}/orders`);

  const response = await fetch(`${apiUrl}/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await Session.getAccessToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    console.error({ status: response.status, statusText: response.statusText });
    throw new Error('Unable to create order!');
  }

  return await response.json();
};

const OrdersRestApi: OrderService = {
  getOrdersAsync: function (): Promise<OrdersResponse> {
    return getOrdersAsync();
  },
  getOrderAsync: function (id: string): Promise<Order | undefined> {
    return getOrderAsync(id);
  },
  createOrdersAsync: function (order: CreateOrder): Promise<{ id: string }> {
    return createOrdersAsync(order);
  },
};

export default OrdersRestApi;
