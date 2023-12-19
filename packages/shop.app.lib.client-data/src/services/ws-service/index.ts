import { Client, createClient } from 'graphql-ws';
import { subscriptions } from '../order-service/orders-graphql';
import { GetAccessTokenFunc } from '..';

export class GraphQlWsClient {
  private client?: Client;
  private graphQlSubscriptionsUrl: string;
  private getAccessToken: GetAccessTokenFunc;

  constructor(env: Record<string, string>, getAccessToken: GetAccessTokenFunc) {
    const { REACT_APP_ORDERS_API_HOST } = env;

    this.graphQlSubscriptionsUrl = `ws://${REACT_APP_ORDERS_API_HOST}/subscriptions`;
    this.getAccessToken = getAccessToken;
  }

  /**
   * Connects to the GraphQL WebSocket socket and starts listening for events.
   * When an event is received, it dispatches an action to update the state.
   * Requires the user to be authenticated otherwise will throw an error.
   * Previously connected sockets will be closed.
   *
   * @param onChangedOrders - A callback function that will be called when orders are changed.
   *                          It receives an array of order IDs as a parameter.
   *                          It can be an async function that returns a Promise.
   * @returns A Promise that resolves when the WebSocket connection is successfully started.
   */
  public async startListening(onChangedOrders: (ids: string[]) => void | Promise<void>) {
    await this.stopListening();

    console.log(
      `Connecting to WS socket on "${this.graphQlSubscriptionsUrl}" and starting listening for events`,
    );

    const accessToken = await this.getAccessToken();

    if (!accessToken) {
      console.log('No access token found. Not connecting to WS socket');
      return;
    }

    this.client = createClient({
      url: this.graphQlSubscriptionsUrl,
      connectionParams: {
        authentication: `Bearer ${accessToken}`,
      },
    });

    this.client.on('error', (err) => {
      // TODO: can add retry after timeout
      console.error('WS socket error');
      console.error(err);
    });

    this.client.on('closed', () => {
      console.log('Disconnected from WS socket');
    });

    console.log('Connected to WS socket. Subscribing to updates');

    this.iterateMessages<{ orderChanged: { id: string } }>(
      async (message) => await onChangedOrders([message.orderChanged.id]),
      subscriptions.SUBSCRIPTION_ORDER_CHANGED,
    );
  }

  iterateMessages<T>(onMessage: (message: T) => void, query: string) {
    (async () => {
      try {
        const subscription = this.client?.iterate<T>({ query });
        if (subscription == null) {
          console.error('Could not subscribe to updates from ws socket');
          return;
        }

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
  public async stopListening() {
    if (this.client) {
      console.log('Stopping listening for events and disconnected from WS socket');
      this.client.terminate();
      await this.client.dispose();
    }
  }
}
