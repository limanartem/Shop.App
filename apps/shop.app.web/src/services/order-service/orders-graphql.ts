import { CreateOrder, Order, OrdersResponse } from '../../model';
import Session from 'supertokens-auth-react/recipe/session';
import { env } from '../../config/environment';
import { OrderService } from '.';
import { createClient } from 'graphql-ws';

const { REACT_APP_ORDERS_API_URL } = env;
const graphQlUrl = `http://${REACT_APP_ORDERS_API_URL}/graphql`;
const graphQlSubscriptionsUrl = `ws://${REACT_APP_ORDERS_API_URL}/subscriptions`;

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

const subscriptions = {
  SUBSCRIPTION_ORDER_CHANGED: `
  subscription {
    orderChanged { id }
  }`,
};

setTimeout(() => {
  connectGraphQLWSSocket();
}, 1000);

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

const createOrdersAsync = async (order: CreateOrder): Promise<{ id: string }> => {
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

async function connectGraphQLWSSocket() {
  console.log(
    `Connecting to WS socket on "${graphQlSubscriptionsUrl}" and starting listening for events`,
  );

  const client = createClient({
    url: graphQlSubscriptionsUrl,
    connectionParams: {
      authentication: `Bearer ${await Session.getAccessToken()}`,
    },
  });

  client.on('error', (err) => {
    console.log('WS client error:', err);
  });

  // subscription
  (async () => {
    const subscription = client.iterate({
      query: subscriptions.SUBSCRIPTION_ORDER_CHANGED,
    });

    for await (const event of subscription) {
      console.log('Received event:', event);

      // complete a running subscription by breaking the iterator loop
      //break;
    }
  })();
}
