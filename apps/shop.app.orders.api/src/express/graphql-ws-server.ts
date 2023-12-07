import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { graphqlSchema } from './graphql/schema';
import { execute, subscribe } from 'graphql';
import { AddressInfo } from 'net';
import { ConnectionInitMessage } from 'graphql-ws';
import { Server } from 'http';
import { decodeToken } from '../auth';

/**
 * Starts the WebSocket server for handling GraphQL subscriptions.
 * @param server The HTTP server instance to attach the WebSocket server to.
 */
export const startWsServer = (server: Server) => {
  console.log('Starting Web Socket Server...');

  const wsServer = new WebSocketServer({
    server,
    path: '/subscriptions',
  });

  const wsServerCleanup = useServer<ConnectionInitMessage['payload'], { userId: string }>(
    {
      schema: graphqlSchema(),
      execute,
      subscribe,
      onConnect: async (ctx) => {
        console.log('Client is trying to connect. Verifying auth....', ctx);
        if (!ctx.connectionParams?.authentication) {
          console.log('Missing authentication. Rejecting connection', ctx);
          return false;
        }
        const authentication: string = ctx.connectionParams.authentication as string;
        const [, token] = authentication.split(' ');
        const decodedToken = await decodeToken(token);

        if (decodedToken?.sub != null) {
          console.log('Authenticated. Allowing connection for user', decodedToken.sub);
          ctx.extra.userId = decodedToken.sub;
          return true;
        }

        console.error('Invalid token. Rejecting connection');

        return false;
      },
      onSubscribe: (ctx, message) => {
        console.log('Client subscribed', { ctx, message });
      },
      onNext: (ctx, message, args, result) => {
        console.log('Next', { ctx, message, args, result });
      },
      onError: (ctx, message, errors) => {
        console.error('Error', { ctx, message, errors });
      },
      onComplete: (ctx, message) => {
        console.log('Complete', { ctx, message });
      },
      context: (ctx) => ({
        userId: ctx.extra?.userId,
      }),
    },
    wsServer,
  );

  const wsAddress = wsServer.address() as AddressInfo;
  console.log(`WebSockets listening on ws://localhost:${wsAddress.port}/subscriptions`);

  server.addListener('close', () => {
    console.log('Server closed. Disposing WS server');
    wsServerCleanup.dispose();
  });
};
