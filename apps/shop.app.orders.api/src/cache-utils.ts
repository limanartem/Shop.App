import { RedisClientType, createClient } from 'redis';

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

let redisClient: RedisClientType | null;

const getRedisClient = async () => {
  if (redisClient) {
    return redisClient;
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

export const get = async (key: string): Promise<string | null> => {
  const client = await getRedisClient();
  const value = await client.get(key);
  return value;
};

export const update = async (key: string, data: string | null): Promise<void> => {
  const client = await getRedisClient();
  if (data == null) {
    console.log(`Removing "${key}" from cache`);
    await client.del(key);
  } else {
    await client.set(key, data);
  }
};

process.on('exit', async () => {
  console.log('Exiting app.');

  if (redisClient) {
    await redisClient.disconnect();
    redisClient = null;
  }
});
