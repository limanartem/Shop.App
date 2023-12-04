import { RedisClientType, createClient } from 'redis';

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

let redisClient: RedisClientType | null;
let isConnected = false;
let isRedisAvailable = true;

process.on('unhandledRejection', function (reason, promise) {
  console.log('unhandledRejection ' + promise.toString() + ' stack ' + JSON.stringify(reason));
});

process.on('exit', async () => {
  console.log('Exiting app.');

  if (redisClient) {
    await redisClient.disconnect();
    redisClient = null;
  }
});

ensureClientConnected();

const REDIS_MAX_CONNECTION_RETRY = 2;
const REDIS_RECONNECT_DELAY = 1000;

/** @type {number}
 * In order to not delay response to client when cache is unavailable we have a
 * cool down period in milliseconds before we will check cache availability again
 **/
const REDIS_AVAILABILITY_CHECK_COOLDOWN_DELAY = 60 * 1000;
const CACHE_TTL_SECONDS = 60;

setInterval(() => {
  isRedisAvailable = true;
}, REDIS_AVAILABILITY_CHECK_COOLDOWN_DELAY);

function getCacheConfig() {
  return {
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
    password: REDIS_PASSWORD,
    socket: {
      connectTimeout: 1000,
      timeout: 1000,
      reconnectStrategy: (retry: number) => {
        if (REDIS_MAX_CONNECTION_RETRY && retry >= REDIS_MAX_CONNECTION_RETRY) {
          isConnected = false;
          isRedisAvailable = false;
          redisClient?.disconnect();
          redisClient?.quit();
          redisClient = null;
          console.log('Max retries reached, exiting');
          return false;
        }
        console.log('Retrying redis connection', retry);
        return REDIS_RECONNECT_DELAY;
      },
    },
  };
}

function ensureClientConnected() {
  if (!isRedisAvailable) {
    console.log('Redis is not available, last connection attempts failed and will be on cool-down');
    return null;
  }

  if (redisClient) {
    if (!isConnected) {
      console.log('Redis client disconnected. Cache will be used when client is connected again');
      return null;
    }
    return redisClient;
  }

  if (REDIS_HOST == null || REDIS_PORT == null || REDIS_PASSWORD == null) {
    console.warn(
      'Missing REDIS_HOST, REDIS_PORT or REDIS_PASSWORD in env variables. Cache will be disabled',
    );
    return null;
  }

  console.log(`Connecting to redis: "redis://${REDIS_HOST}:${REDIS_PORT}`);

  redisClient = createClient(getCacheConfig());
  redisClient.on('error', (err) => {
    isConnected = false;
    console.log('Redis Client Error', err);
  });
  redisClient.on('ready', () => (isConnected = true));
  redisClient.on('end', () => {
    console.log('Redis client is disconnecting.,,');
    redisClient = null;
  });
  redisClient.connect();

  return redisClient;
}

export const get = async (key: string): Promise<string | null | undefined> => {
  try {
    const client = ensureClientConnected();
    const value = await client?.get(key);
    return value;
  } catch (error) {
    console.error(`Error occurred during reading cache key "${key}"`, error);
    return null;
  }
};

export const update = async (key: string, data: string | null): Promise<void> => {
  try {
    const client = ensureClientConnected();
    if (data == null) {
      console.log(`Removing "${key}" from cache`);
      await client?.del(key);
    } else {
      await client?.set(key, data, {
        EX: CACHE_TTL_SECONDS,
      });
    }
  } catch (error) {
    console.error(`Error occurred during updating cache key "${key}"`, error);
  }
};

export const getObject = async <Type>(
  key: string,
  group?: string,
): Promise<Type | null | undefined> => {
  const value = await get(createKey(key, group));
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
  await update(cacheKey, data ? JSON.stringify(data) : null);
};

function createKey(key: string, group?: string) {
  return group != null ? `${group}_${key}` : key;
}
