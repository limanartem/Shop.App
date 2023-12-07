import { useAppDispatch } from '../../app/hooks';
import { Client, createClient } from 'graphql-ws';
import Session from 'supertokens-auth-react/recipe/session';
import { subscriptions } from '../order-service/orders-graphql';
import { setChangedOrders } from '../../app/reducers/notificationsReducer';
import { env } from '../../config/environment';

const { REACT_APP_ORDERS_API_HOST } = env;

const graphQlSubscriptionsUrl = `ws://${REACT_APP_ORDERS_API_HOST}/subscriptions`;

let client: Client;

/**
 * Connects to the GraphQL WebSocket socket and starts listening for events.
 * When an event is received, it dispatches an action to update the state.
 * Requires the user to be authenticated otherwise will throw an error.
 * Previously connected sockets will be closed.
 *
 * @param dispatch - The dispatch function from the Redux store.
 * @returns A promise that resolves when the connection is established.
 */
export async function startListening(dispatch: ReturnType<typeof useAppDispatch>) {
  await stopListening();

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
    // TODO: can add retry after timeout
    console.error('WS socket error');
    console.error(err);
  });

  client.on('closed', () => {
    console.log('Disconnected from WS socket');
  });

  console.log('Connected to WS socket. Subscribing to updates');

  iterateMessages<{ orderChanged: { id: string } }>(
    (message) => dispatch(setChangedOrders([message.orderChanged.id])),
    subscriptions.SUBSCRIPTION_ORDER_CHANGED,
  );
}

function iterateMessages<T>(onMessage: (message: T) => void, query: string) {
  (async () => {
    try {
      const subscription = client.iterate<T>({ query });

      for await (const event of subscription) {
        console.log('Received event:', event);

        if (event.data != null) {
          onMessage(event.data);
        }
        // complete a running subscription by breaking the iterator loop
        //break;
      }
    } catch (error) {
      console.error('Could not subscribe to updates from ws socket');
      console.error(error);
    }
  })();
}

/**
 * Stops listening for events and disconnects from the GraphQL WebSocket socket.
 */
export async function stopListening() {
  if (client) {
    console.log('Stopping listening for events and disconnected from WS socket');
    client.terminate();
    await client.dispose();
  }
}
