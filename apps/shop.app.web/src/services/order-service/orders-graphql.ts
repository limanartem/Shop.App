import { CreateOrder, Order, OrdersResponse } from '../../model';
import Session from 'supertokens-auth-react/recipe/session';
import { env } from '../../config/environment';
import { OrderService } from '.';
import rest from './orders-rest-api';

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

export const subscriptions = {
  SUBSCRIPTION_ORDER_CHANGED: `
  subscription {
    orderChanged { id }
  }`,
};

const getGraphqlResult = async (response: Response) => {
  const result = await response.json();
  if (result.errors != null) {
    throw new Error(JSON.stringify(result.errors));
  }
  return result.data;
};

const getOrdersAsync = async (): Promise<OrdersResponse> => {
  console.log(`Fetching orders from ${graphQlUrl}`);

  const response = await fetch(graphQlUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await Session.getAccessToken()}`,
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
      Authorization: `Bearer ${await Session.getAccessToken()}`,
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
    return rest.createOrdersAsync(order);
  },
};

export default OrdersRestApi;
