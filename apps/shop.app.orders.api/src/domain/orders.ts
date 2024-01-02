/**
 * This file contains utility functions for working with data in the application.
 * It includes functions for fetching, updating, and creating orders, as well as
 * functions for caching and retrieving data from the database.
 */
import { ObjectId } from 'mongodb';
import { getObject as getCachedObject, updateObject as updateCacheObject } from '@shop.app/lib.db/dist/cache';
import { ProductItem, Order, OrderItemEnhanced, UpdateOrder, OrderItem } from '../model';
import {
  WithClearId,
  fetchDocument,
  fetchDocuments,
  insertDocument,
  updateDocument,
} from '@shop.app/lib.db/dist/mongodb';
const { CATALOG_API_URL } = process.env;
const ORDERS_CACHE_GROUP = 'orders';

/**
 * Creates an order.
 * @param order - The order to be created.
 * @returns A promise that resolves to the result of inserting the order document.
 */
export const createOrder = async (order: Order): Promise<ReturnType<typeof insertDocument>> =>
  insertDocument(order);

/**
 * Updates an order with the specified ID.
 * If the order is successfully updated, the cache for the order is invalidated.
 * If the cache service is unavailable, a stale value may remain in the cache until the service is up again.
 * To mitigate this, a shorter TTL (Time To Live) is set for cache keys.
 * @param id - The ID of the order to update.
 * @param order - The updated order data.
 * @returns A promise that resolves to the updated order if it exists, or null if no order with the specified ID was found.
 */
export const updateOrder = async (
  id: string,
  order: UpdateOrder,
): Promise<ReturnType<typeof updateDocument>> => {
  const updatedOrder = await updateDocument(id, order);
  if (updatedOrder != null) {
    console.log(`Updated order id = ${id}, invalidating cache...`);
    // TODO: if cache service is unavailable we could potentially leave stale value in cache
    //  which would be used next time service is up again. To mitigate this we are setting
    //  shorter TTL for cache keys
    await updateCacheObject(id, null, ORDERS_CACHE_GROUP);
    return updatedOrder;
  }
  console.log(`No order with id = ${id} was updated.`);

  return null;
};

/**
 * Updates an order item with the specified ID and product ID.
 * @param id - The ID of the order.
 * @param productId - The ID of the product.
 * @param order - The updated order information.
 * @returns A promise that resolves to the updated order item, or null if the order item does not exist.
 */
export const updateOrderItem = async (
  id: string,
  productId: string,
  order: UpdateOrder,
): Promise<ReturnType<typeof updateDocument> | null> => {
  const currentOrder = await fetchDocument({ id });
  if (currentOrder != null) {
    const items = (currentOrder.items as OrderItem[]).map((item: OrderItem) => {
      if (item.productId === productId) {
        item.status = order.status;
      }
      return item;
    });
    return await updateDocument(id, { items });
    //await updateCache(id, null);
  }
  return null;
};

/**
 * Retrieves orders for a given user.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to the fetched orders.
 */
export const getOrders = async (
  userId: string,
): ReturnType<typeof fetchDocuments<Order<OrderItemEnhanced>>> => fetchDocuments({ userId });

const useCache = async <Type>(
  cache: { group?: string; key: string },
  fallback: () => Promise<Type | null>,
): Promise<Type | null> => {
  const { group, key } = cache;
  const cachedValue = await getCachedObject<Type>(key, group);
  if (cachedValue != null) {
    console.log(
      `Found item with group= "${group}", key = "${key}" in the cache. Returning cached item`,
    );
    return cachedValue;
  }

  console.log(`Cache missed for group = "${group}", key = "${key}", fetching from db`);
  const result = await fallback();
  if (result != null) {
    console.log('Found item in db. Updating cache...', group, key);
    await updateCacheObject(key, result, group);
  }
  return result;
};

/**
 * Retrieves an order from the database.
 * @param orderId - The ID of the order.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to the fetched order.
 */
export const getOrder = async (
  orderId: string,
  userId: string,
): ReturnType<typeof fetchDocument<Order<OrderItemEnhanced>>> => {
  return await useCache({ group: ORDERS_CACHE_GROUP, key: orderId }, () =>
    fetchDocument({ _id: ObjectId.createFromHexString(orderId), userId }),
  );
};

/**
 * Retrieves the expanded orders for a given user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the expanded orders.
 */
export const getOrdersExpanded = async (userId: string): ReturnType<typeof getOrders> => {
  const orders = await getOrders(userId);
  await Promise.all(orders.map(expandOrder));
  return orders;
};

/**
 * Retrieves an expanded order by its ID and user ID.
 * @param orderId - The ID of the order.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to the expanded order.
 */
export const getOrderExpanded = async (
  orderId: string,
  userId: string,
): ReturnType<typeof getOrder> => {
  const order = await getOrder(orderId, userId);
  if (order != null) {
    await expandOrder(order);
  }
  return order;
};

/**
 * Fetches product details for the given product IDs from the catalog API.
 * @param productIds - An array of product IDs.
 * @returns A promise that resolves to an array of ProductItem objects representing the product details.
 * @throws An error if the request to the catalog API fails.
 */
export const getProductDetails = async (productIds: string[]): Promise<ProductItem[]> => {
  console.log(
    `Fetching product details from "${CATALOG_API_URL}/products/search" for productIds`,
    productIds,
  );

  const response = await fetch(`${CATALOG_API_URL}/products/search`, {
    method: 'POST',
    body: JSON.stringify(productIds),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Could not fetch products from catalog, error: ${response.status}: ${response.statusText}`,
    );
  }

  return (await response.json()) as ProductItem[];
};

const expandOrder = async (order: WithClearId<Order<OrderItemEnhanced>>) => {
  const productIds = order.items?.map((i) => i.productId);
  try {
    const products = await getProductDetails(productIds);
    if (products?.length > 0) {
      order.items?.forEach((item) => {
        item.product = products.find((p) => p.id === item.productId);
      });
    }
  } catch (error) {
    console.error('Error fetching product details', error, productIds);
  }
};
