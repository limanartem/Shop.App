import { ObjectId } from 'mongodb';
import {
  get as getCache,
  getObject as getCachedObject,
  update as updateCache,
  updateObject as updateCacheObject,
} from './cache-utils';
import { ProductItem, Order, OrderItemEnhanced, UpdateOrder, OrderItem } from './model';
import {
  WithClearId,
  fetchDocument,
  fetchDocuments,
  insertDocument,
  updateDocument,
} from './mongodb-client';
const { CATALOG_API_URL } = process.env;
const ORDERS_CACHE_GROUP = 'orders';

export const fetchItem = async (id: string): Promise<any | null> => {
  const cachedValue = await getCache(id);
  if (cachedValue) {
    console.log(`Found item with id = "${id}" in cache. Returning cached item`);
    return JSON.parse(cachedValue);
  }
  console.log('Cache missed. Fetching from db...');

  const value = await fetchDocument({ id });
  if (value) {
    console.log('Found item in db. Updating cache...');
    updateCache(id, JSON.stringify(value));
  }
  return value;
};

export const updateItem = async (id: string, data: any): Promise<void> => {
  console.log('Updating item in db...');
  await updateDocument(id, data);
  console.log('Invalidating cache..');
  await updateCache(id, null);
};

export const createOrder = async (order: Order): Promise<ReturnType<typeof insertDocument>> =>
  insertDocument(order);

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

export const getOrder = async (
  orderId: string,
  userId: string,
): ReturnType<typeof fetchDocument<Order<OrderItemEnhanced>>> => {
  return await useCache({ group: ORDERS_CACHE_GROUP, key: orderId }, () =>
    fetchDocument({ _id: ObjectId.createFromHexString(orderId), userId }),
  );
};

export const getOrdersExpanded = async (userId: string): ReturnType<typeof getOrders> => {
  const orders = await getOrders(userId);
  await Promise.all(orders.map(expandOrder));
  return orders;
};

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
