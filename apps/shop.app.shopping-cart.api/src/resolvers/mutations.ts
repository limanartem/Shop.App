import { RequestContext } from '../types';
import {
  MutationMergeArgs,
  MutationResolvers,
  ShoppingCart,
} from '../generated/graphql';
import {
  deleteDocument,
  fetchDocument,
  insertDocument,
  updateDocument,
} from '@shop.app/lib.server-utils/dist/mongodb';

/**
 * Updates the shopping cart for a given user.
 * If the shopping cart document does not exist, it will be created.
 *
 * @param userId - The ID of the user.
 * @param updateFn - A function that takes the current shopping cart and returns a boolean indicating whether the cart should be updated.
 * @returns The updated shopping cart.
 * @throws Error if the update fails.
 */
const updateShoppingCart = async (
  userId: string,
  updateFn: (cart: ShoppingCart) => boolean,
): Promise<ShoppingCart> => {
  let document = (await fetchDocument<ShoppingCart>({ userId }, 'shopping-cart')) as ShoppingCart;

  if (document == null) {
    document = (await insertDocument<ShoppingCart>(
      { userId, items: [] },
      'shopping-cart',
    )) as ShoppingCart;
  }

  if (document.items == null) {
    document.items = [];
  }

  if (updateFn(document)) {
    const updatedDocument = await updateDocument(document.id, document, 'shopping-cart');

    if (updatedDocument == null) {
      throw new Error('Failed to update shopping cart');
    }

    return updatedDocument as unknown as ShoppingCart;
  }
  return document;
};

/**
 * Adds an item to the shopping cart.
 * If the item already exists in the cart, its quantity will be incremented.
 * @param _ - The parent object (not used).
 * @param item - The item to add to the cart.
 * @param context - The request context.
 * @returns The updated shopping cart.
 */
export const addToCart: MutationResolvers['addToCart'] = async (
  _: any,
  { item },
  context: RequestContext,
) => {
  return updateShoppingCart(context.userId, (cart) => {
    const existingItem = cart.items?.find((i) => i.productId === item.productId);
    if (existingItem != null) {
      existingItem.quantity += item.quantity;
    } else {
      cart.items?.push(item);
    }
    return true;
  });
};

/**
 * Removes an item from the shopping cart.
 * @param _ - The parent object (not used).
 * @param productId - The ID of the product to remove.
 * @param context - The request context.
 * @returns The updated shopping cart.
 */
export const removeFromCart: MutationResolvers['removeFromCart'] = async (
  _: any,
  { productId },
  context: RequestContext,
) => {
  return updateShoppingCart(context.userId, (cart) => {
    const existingItemIndex = cart.items?.findIndex((i) => i.productId === productId) ?? -1;
    if (existingItemIndex > -1) {
      cart.items?.splice(existingItemIndex, 1);
      return true;
    }
    return false;
  });
};

/**
 * Updates the quantity of an item in the shopping cart.
 * @param _ - The parent object (not used).
 * @param productId - The ID of the product to update.
 * @param quantity - The new quantity.
 * @param context - The request context.
 * @returns The updated shopping cart.
 */
export const updateQuantity: MutationResolvers['updateQuantity'] = async (
  _: any,
  { productId, quantity },
  context: RequestContext,
) => {
  return updateShoppingCart(context.userId, (cart) => {
    const existingItem = cart.items?.find((i) => i.productId === productId);
    if (existingItem != null) {
      existingItem.quantity = quantity;
      return true;
    }
    return false;
  });
};

/**
 * Deletes the shopping cart for the current user.
 * @param _ - The parent resolver's result.
 * @param __ - The arguments passed to the resolver.
 * @param context - The context object containing user information.
 * @returns An object indicating whether the shopping cart was successfully deleted.
 */
export const deleteCart: MutationResolvers['deleteCart'] = async (
  _: any,
  __: any,
  context: RequestContext,
) => {
  const result = await deleteDocument({ userId: context.userId }, 'shopping-cart');
  return {
    deleted: result,
  };
};

export const mergeCart: MutationResolvers['merge'] = async (
  _: any,
  args: MutationMergeArgs,
  context: RequestContext,
) => {
  const cart = await fetchDocument<ShoppingCart>({ userId: context.userId }, 'shopping-cart');

  if (cart == null) {
    throw new Error('Cart not found');
  }

  return updateShoppingCart(context.userId, (userCart) => {
    if (userCart.items == null) {
      userCart.items = [];
    }

    args.input?.items?.forEach((item) => {
      const existingItem = userCart.items?.find((i) => i.productId === item.productId);
      if (existingItem != null) {
        existingItem.quantity += item.quantity;
      } else {
        userCart.items?.push(item);
      }
    });

    return true;
  });
};
