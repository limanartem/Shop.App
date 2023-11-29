import { RedisClientType, createClient } from 'redis';

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

let redisClient: RedisClientType | null;

const getRedisClient = async () => {
  if (redisClient) {
    return redisClient;
  }

  if (REDIS_HOST == null || REDIS_PORT == null || REDIS_PASSWORD == null) {
    console.warn(
      'Missing REDIS_HOST, REDIS_PORT or REDIS_PASSWORD in env variables. Cache will be disabled',
    );
    return null;
  }

  console.log(`Connecting to redis: "redis://${REDIS_HOST}:${REDIS_PORT}`);

  redisClient = (await createClient({
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
    password: REDIS_PASSWORD,
  })
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect()) as RedisClientType;
  return redisClient;
};

export const get = async (key: string): Promise<string | null | undefined> => {
  const client = await getRedisClient();
  const value = await client?.get(key);
  return value;
};

export const getObject = async <Type>(
  key: string,
  group?: string,
): Promise<Type | null | undefined> => {
  const client = await getRedisClient();
  const value = await client?.get(createKey(key, group));
  if (value) {
    return JSON.parse(value) as Type;
  }
  return null;
};

export const updateObject = async (
  key: string,
  data: object | null,
  group?: string,
): Promise<void> => {
  const cacheKey = createKey(key, group);
  const client = await getRedisClient();
  if (data == null) {
    console.log(`Removing "${cacheKey}" from cache`);
    await client?.del(cacheKey);
  } else {
    await client?.set(cacheKey, JSON.stringify(data));
  }
};

export const update = async (key: string, data: string | null): Promise<void> => {
  const client = await getRedisClient();
  if (data == null) {
    console.log(`Removing "${key}" from cache`);
    await client?.del(key);
  } else {
    await client?.set(key, data);
  }
};

process.on('exit', async () => {
  console.log('Exiting app.');

  if (redisClient) {
    await redisClient.disconnect();
    redisClient = null;
  }
});
function createKey(key: string, group?: string) {
  return group != null ? `${group}_${key}` : key;
}
