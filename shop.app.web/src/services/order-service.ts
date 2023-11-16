import { Order, OrdersResponse } from '../model';
import Session from 'supertokens-auth-react/recipe/session';

const { REACT_APP_ORDERS_API_URL } = process.env;

export const getOrdersAsync = async (): Promise<OrdersResponse> => {
  console.log(`Fetching orders from ${REACT_APP_ORDERS_API_URL}/orders`);
  
  const response = await fetch(`${REACT_APP_ORDERS_API_URL}/orders`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${await Session.getAccessToken()}`
    }
  });

  if (!response.ok) {
    console.error({ status: response.status, statusText: response.statusText });
    throw new Error('Unable to get orders!');
  }

  return await response.json();
};
