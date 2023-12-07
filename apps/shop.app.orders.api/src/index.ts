import { start } from './express/server';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { graphqlSchema } from './express/graphql/schema';
import { execute, subscribe } from 'graphql';
import { AddressInfo } from 'net';
import JsonWebToken, { JwtHeader, JwtPayload, SigningKeyCallback } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { ConnectionInitMessage } from 'graphql-ws';

const { WEB_SERVER_PORT } = process.env;

const { AUTH_CORE_URL = 'localhost:3003' } = process.env;

const client = jwksClient({
  jwksUri: `http://${AUTH_CORE_URL}/auth/jwt/jwks.json`,
});

const getKey = (header: JwtHeader, callback: SigningKeyCallback) => {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key!.getPublicKey();
    console.log({ err, signingKey });
    callback(err, signingKey);
  });
};

const server = start().listen(WEB_SERVER_PORT, () => {
  console.log(`Server is running on port ${WEB_SERVER_PORT}`);
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
          return false;
        }
        const authentication: string = ctx.connectionParams.authentication as string;
        const [, token] = authentication.split(' ');
        const decodedToken = await new Promise<JwtPayload | null>((resolve) => {
          JsonWebToken.verify(token, getKey, {}, (err, decoded) => {
            console.log({ err, decoded });
            if (err || decoded == null) {
              console.error(err);
              console.error('Invalid token. Rejecting connection');
              resolve(null);
            } else {
              console.log('Authenticated. Allowing connection', decoded);
              resolve(decoded as JwtPayload);
            }
          });
        });

        if (decodedToken?.sub != null) {
          ctx.extra.userId = decodedToken.sub;
          return true;
        }

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
        userId: ctx.extra.userId,
      })
    },
    wsServer,
  );

  const wsAddress = wsServer.address() as AddressInfo;
  console.log(`WebSockets listening on ws://localhost:${wsAddress.port}/subscriptions`);

  server.addListener('close', () => {
    console.log('Server closed. Disposing WS server');
    wsServerCleanup.dispose();
  });
});
