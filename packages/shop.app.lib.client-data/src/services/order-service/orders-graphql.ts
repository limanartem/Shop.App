/* eslint-disable @typescript-eslint/no-unused-vars */
import { CreateOrder, Order, OrdersResponse } from '../../model';
import { OrderService } from '.';
import rest from './orders-rest-api';
import { GetAccessTokenFunc } from '..';

function init(env: Record<string, string>, getAccessToken: GetAccessTokenFunc) {
  const { REACT_APP_ORDERS_API_HOST } = env;
  const graphQlUrl = `http://${REACT_APP_ORDERS_API_HOST}/graphql`;

  const fragments = {
    ORDER: `fragment orderFields on Order { 
    id, 
    status, 
    createdAt,  
    shipping {
      address,
      country,
      zip,
      city
    },
    payment {
      bank {
        iban
      }
    },
    items { 
      productId,
      quantity, 
      product { 
        title,
        description,
        price,
        currency
      }
    } 
  }`,
  };

  const queries = {
    QUERY_ORDERS: `query { orders { ...orderFields } }, ${fragments.ORDER}`,
    QUERY_ORDER: `
  query getOrder($id: ObjectID!) {
      order(id: $id) { ...orderFields } 
  }, ${fragments.ORDER}`,
  };

  const getGraphqlResult = async (response: Response) => {
    const result = await response.json();
    if (result.errors != null) {
      throw new Error(JSON.stringify(result.errors));
    }
    return result.data;
  };

  const getOrdersAsync = async (): Promise<OrdersResponse> => {
    const token = await getAccessToken();
    if (token == null) {
      throw new Error('User is not logged in');
    }

    const response = await fetch(graphQlUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: queries.QUERY_ORDERS,
      }),
    });

    if (!response.ok) {
      console.error({ status: response.status, statusText: response.statusText });
      throw new Error('Unable to get orders!');
    }

    return await getGraphqlResult(response);
  };

  const getOrderAsync = async (id: string): Promise<Order | undefined> => {
    console.log(`Fetching order from ${graphQlUrl}`);

    const response = await fetch(`${graphQlUrl}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: queries.QUERY_ORDER,
        variables: { id },
      }),
    });

    if (!response.ok) {
      console.error({ status: response.status, statusText: response.statusText });
      throw new Error('Unable to get order!');
    }

    const { order } = await getGraphqlResult(response);
    return order;
  };

  const OrdersRestApi: OrderService = {
    getOrdersAsync: function (): Promise<OrdersResponse> {
      return getOrdersAsync();
    },
    getOrderAsync: function (id: string): Promise<Order | undefined> {
      return getOrderAsync(id);
    },
    createOrdersAsync: function (order: CreateOrder): Promise<{ id: string }> {
      // Fallback to rest api for now
      return rest(env, getAccessToken).createOrdersAsync(order);
    },
  };
  return OrdersRestApi;
}
export default init;

export const subscriptions = {
  SUBSCRIPTION_ORDER_CHANGED: `
subscription {
  orderChanged { id, timestamp }
}`,
};
