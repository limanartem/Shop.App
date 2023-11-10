import { get as getCache, update as updateCache } from './cache-utils';
import { fetchDocument, updateDocument } from './mongodb-client';

export const fetchItem = async (id: string): Promise<any | null> => {
  const cachedValue = await getCache(id);
  if (cachedValue) {
    console.log(`Found item with id = "${id}" in cache. Returning cached item`);
    return JSON.parse(cachedValue);
  }
  console.log('Cache missed. Fetching from db...');

  const value = await fetchDocument(id);
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