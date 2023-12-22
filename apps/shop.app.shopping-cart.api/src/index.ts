import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = `#graphql
  type ShoppingCart {
    id: ID
    userId: ID
    items: [ShoppingCartItem]
  }

  type ShoppingCartItem {
    productId: String
    quantity: Int
    product: ProductItem
  }

  type ProductItem {
    id: ID
    title: String
    description: String
    price: Float
    currency: String
  }
  type Query {
    shoppingCart: ShoppingCart
  }
`;

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
