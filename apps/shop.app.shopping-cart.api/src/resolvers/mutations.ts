import { RequestContext } from '../types';
import { MutationResolvers, ShoppingCart } from '../generated/graphql';
import {
  fetchDocument,
  insertDocument,
  updateDocument,
} from '@shop.app/lib.server-utils/dist/mongodb';

export const addToCart: MutationResolvers['addToCart'] = async (
  _: any,
  { item },
  context: RequestContext,
) => {
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
};

export const removeFromCart: MutationResolvers['removeFromCart'] = async (
  _: any,
  { productId },
  context: RequestContext,
) => {
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
};

export const updateQuantity: MutationResolvers['updateQuantity'] = async (
  _: any,
  { productId, quantity },
  context: RequestContext,
) => {
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
};
