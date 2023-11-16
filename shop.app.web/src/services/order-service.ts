import { CreateOrder, OrdersResponse } from '../model';
import Session from 'supertokens-auth-react/recipe/session';

const { REACT_APP_ORDERS_API_URL } = process.env;

export const getOrdersAsync = async (): Promise<OrdersResponse> => {
  console.log(`Fetching orders from ${REACT_APP_ORDERS_API_URL}/orders`);

  const response = await fetch(`${REACT_APP_ORDERS_API_URL}/orders`, {
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

export const createOrdersAsync = async (order: CreateOrder): Promise<{ id: string }> => {
  console.log(`Creation new orders using POST ${REACT_APP_ORDERS_API_URL}/orders`);

  const response = await fetch(`${REACT_APP_ORDERS_API_URL}/orders`, {
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
