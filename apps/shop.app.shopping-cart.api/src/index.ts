import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const typeDefs = readFileSync(path.join(__dirname, 'schema.graphql'), { encoding: 'utf-8' });

const resolvers = {
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

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
