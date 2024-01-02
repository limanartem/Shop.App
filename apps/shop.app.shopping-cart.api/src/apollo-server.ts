import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import path from 'path';
import { Resolvers } from './generated/graphql';

const { WEB_SERVER_PORT } = process.env;

export interface RequestContext {
  token?: String;
}

const typeDefs = readFileSync(path.join(__dirname, 'schema.graphql'), { encoding: 'utf-8' });

const resolvers: Resolvers = {
  Query: {
    shoppingCart: () => {
      return {
        userId: '123',
        items: [
          {
            productId: '123',
            quantity: 1,
            product: {
              id: '123',
              title: 'Test',
              description: 'Test',
              price: 1,
              currency: 'USD',
            },
          },
        ],
      };
    },
  },
};

export default async function createApolloServer() {
  const server = new ApolloServer<RequestContext>({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: Number.parseInt(WEB_SERVER_PORT!) },
    context: async ({ req }) => ({ token: req.headers.authorization || '' }),
  });

  console.log(`🚀  Server ready at: ${url}`);

  return { server, url };
}
