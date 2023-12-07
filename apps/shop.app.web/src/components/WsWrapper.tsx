import React, { ReactNode, useEffect } from 'react';
import { useAppSelector } from '../app/hooks';
import { selectUser } from '../app/reducers/authReducer';
import { Client, createClient } from 'graphql-ws';
import { env } from '../config/environment';
import Session from 'supertokens-auth-react/recipe/session';
import { subscriptions } from '../services/order-service/orders-graphql';

const { REACT_APP_ORDERS_API_URL } = env;

const graphQlSubscriptionsUrl = `ws://${REACT_APP_ORDERS_API_URL}/subscriptions`;

interface WsWrapperProps {
  children: ReactNode;
}

let client: Client;

async function connectGraphQLWSSocket() {
  console.log(
    `Connecting to WS socket on "${graphQlSubscriptionsUrl}" and starting listening for events`,
  );

  client = createClient({
    url: graphQlSubscriptionsUrl,
    connectionParams: {
      authentication: `Bearer ${await Session.getAccessToken()}`,
    },
  });

  client.on('error', (err) => {
    console.error(err);
  });

  client.on('closed', () => {
    console.log('Disconnected from WS socket');
  });

  console.log('Connected to WS socket. Subscribing to updates');
  // subscription
  (async () => {
    try {
      const subscription = client.iterate({
        query: subscriptions.SUBSCRIPTION_ORDER_CHANGED,
      });

      for await (const event of subscription) {
        console.log('Received event:', event);

        // complete a running subscription by breaking the iterator loop
        //break;
      }
    } catch (error) {
      console.error('Could not subscribe to updates from ws socket');
      console.error(error);
    }
  })();
}
export const WsWrapper: React.FC<WsWrapperProps> = ({ children }) => {
  const user = useAppSelector(selectUser);

  useEffect(() => {
    if (client != null) {
      console.log('User changed, closing previous WS connection...');
      client.terminate();
    }

    if (user != null) {
      (async () => {
        await connectGraphQLWSSocket();
      })();
    }
  }, [user]);

  return <>{children}</>;
};
