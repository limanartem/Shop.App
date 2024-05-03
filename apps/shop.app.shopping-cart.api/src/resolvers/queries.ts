import { RequestContext } from '../types';
import { QueryResolvers, ShoppingCart } from '../generated/graphql';
import {
  fetchDocument,
} from '@shop.app/lib.server-utils/dist/mongodb';

/**
 * Retrieves the shopping cart for the current user.
 * @param _ - The parent object (unused).
 * @param __ - The arguments (unused).
 * @param context - The context object containing the user ID.
 * @returns The shopping cart document for the current user, or null if it doesn't exist.
 */
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
