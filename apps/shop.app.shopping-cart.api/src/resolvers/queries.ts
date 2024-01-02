import { RequestContext } from '../types';
import { QueryResolvers, ShoppingCart } from '../generated/graphql';
import {
  fetchDocument,
} from '@shop.app/lib.server-utils/dist/mongodb';

export const shoppingCart: QueryResolvers['shoppingCart'] = async (
  _: any,
  __: any,
  context: RequestContext,
) => {
  const document = await fetchDocument<ShoppingCart>({ userId: context.userId }, 'shopping-cart');
  if (document == null) {
    return null;
  }
  return document;
};
