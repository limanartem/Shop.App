import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import path from 'path';
import { Resolvers, ShoppingCart } from './generated/graphql';
import { GraphQLError } from 'graphql';
import { decodeToken } from '@shop.app/lib.server-utils/dist/auth';
import { StatusCodes } from 'http-status-codes';
import {
  fetchDocument,
  insertDocument,
  updateDocument,
} from '@shop.app/lib.server-utils/dist/mongodb';
import { WithId } from 'mongodb';

const { WEB_SERVER_PORT } = process.env;

export interface RequestContext {
  userId: string;
}

const typeDefs = readFileSync(path.join(__dirname, 'schema.graphql'), { encoding: 'utf-8' });

const resolvers: Resolvers = {
  Query: {
    shoppingCart: async (_: any, __: any, context: RequestContext) => {
      const document = await fetchDocument<ShoppingCart>(
        { userId: context.userId },
        'shopping-cart',
      );
      if (document == null) {
        return null;
      }
      return document;
    },
  },
  Mutation: {
    addToCart: async (_: any, { item }, context: RequestContext) => {
      let document = (await fetchDocument<ShoppingCart>(
        { userId: context.userId },
        'shopping-cart',
      )) as ShoppingCart;

      if (document == null) {
        return (await insertDocument<ShoppingCart>(
          { userId: context.userId, items: [item] },
          'shopping-cart',
        )) as ShoppingCart;
      }
      if (document.items == null) {
        document.items = [];
      }
      //Check if item with product id already exists and then merge
      const existingItem = document.items?.find((i) => i.productId === item.productId);
      if (existingItem != null) {
        existingItem.quantity += item.quantity;
      } else {
        document.items.push(item);
      }

      const updatedDocument = await updateDocument(document.id!, document, 'shopping-cart');
      if (updatedDocument == null) {
        throw new Error('Failed to update shopping cart');
      }
      return updatedDocument as unknown as ShoppingCart;
    },
    removeFromCart: async (_: any, { productId }, context: RequestContext) => {
      let document = (await fetchDocument<ShoppingCart>(
        { userId: context.userId },
        'shopping-cart',
      )) as ShoppingCart;

      if (document == null) {
        return null;
      }
      if (document.items == null) {
        document.items = [];
      }
      //Check if item with product id already exists and then merge
      const existingItemIndex = document.items.findIndex((i) => i.productId === productId);
      if (existingItemIndex > -1) {
        document.items.splice(existingItemIndex, 1);

        const updatedDocument = await updateDocument(document.id!, document, 'shopping-cart');
        if (updatedDocument == null) {
          throw new Error('Failed to update shopping cart');
        }
        return updatedDocument as unknown as ShoppingCart;
      }
      return document;
    },
    updateQuantity: async (_: any, { productId, quantity }, context: RequestContext) => {
      let document = (await fetchDocument<ShoppingCart>(
        { userId: context.userId },
        'shopping-cart',
      )) as ShoppingCart;

      if (document == null) {
        return null;
      }
      if (document.items == null) {
        document.items = [];
      }
      //Check if item with product id already exists and then merge
      const existingItem = document.items.find((i) => i.productId === productId);
      if (existingItem != null) {
        existingItem.quantity = quantity;

        const updatedDocument = await updateDocument(document.id!, document, 'shopping-cart');
        if (updatedDocument == null) {
          throw new Error('Failed to update shopping cart');
        }

        return updatedDocument as unknown as ShoppingCart;
      }
      return document;
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
    context: async ({ req }) => {
      const authentication = req.headers.authorization;
      if (authentication == null) {
        throw UnauthenticatedError();
      }
      const [, token] = authentication.split(' ');
      const jwtToken = await decodeToken(token);
      if (!jwtToken?.sub) {
        throw UnauthenticatedError();
      }

      return { userId: jwtToken.sub };
    },
  });

  console.log(`🚀  Server ready at: ${url}`);

  return { server, url };
}
function UnauthenticatedError() {
  return new GraphQLError('User is not authenticated', {
    extensions: {
      code: 'UNAUTHENTICATED',
      http: { status: StatusCodes.UNAUTHORIZED },
    },
  });
}
