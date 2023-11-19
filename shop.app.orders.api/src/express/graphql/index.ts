import { Express } from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import { getProductDetails, getOrdersExpanded } from '../../data-utils';
import { SessionRequest } from 'supertokens-node/framework/express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';

const schema = buildSchema(`
  directive @inherits(type: String!) on OBJECT

  type Order {
    id: ID!
    userId: ID!
    createdAt: String!
    updatedAt: String!
    status: String!
    items: [Item!]!
    shipping: Shipping!
    payment: Payment!
  }

  type Item {
    status: String
    productId: ID!
    quantity: Int!
    product: ProductItem
  }

  type ProductItem {
    id: ID!
    title: String
    description: String
    price: Int
    currency: String
    capacity: Int
    category: String
  }

  type Shipping {
    address: String!
    country: String!
    zip: String!
    city: String!
  }

  type Bank {
    iban: String!
  }

  type Payment {
    bank: Bank!
  }

  type Query {
    orders: [Order!]!
  }
`);

const root = {
  orders: async (_: any, req: SessionRequest) => {
    const userId = req.session.getUserId();

    return await getOrdersExpanded(userId);
  },
};

export const useGraphql = (app: Express) => {
  console.log('Configuring graphql..');
  app.use('/graphql', verifySession());
  app.use(
    '/graphql',
    graphqlHTTP((req: SessionRequest) => ({
      schema: schema,
      rootValue: root,
      graphiql: true,
      context: {
        session: req.session,
      },
    })),
  );
};
