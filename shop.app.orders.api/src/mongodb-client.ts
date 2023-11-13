import { MongoClient, ServerApiVersion } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

const { MONGODB_URL, MONGO_DB_USERNAME, MONGO_DB_PASSWORD } = process.env;
type DbCollection = 'orders' | 'payment';

const getClient = () =>
  new MongoClient(MONGODB_URL, {
    auth: {
      username: MONGO_DB_USERNAME,
      password: MONGO_DB_PASSWORD,
    },
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

export const fetchDocument = async (id: string): Promise<any> => {
  console.log(`Connecting to db ${MONGODB_URL} with ${MONGO_DB_USERNAME} user...`);
  const client = getClient();
  await client.connect();
  console.log('Fetching item from db...');
  const order = await client.db('items').collection('orders').findOne({ id });
  await client.close();
  return order;
};

export const updateDocument = async <T extends object>(id: string, data: T): Promise<void> => {
  console.log(`Connecting to db ${MONGODB_URL} with ${MONGO_DB_USERNAME} user...`);
  const client = getClient();
  await client.connect();
  console.log('Updating item in db...');
  await client
    .db('shop.app.orders.db')
    .collection('orders')
    .insertOne({ id, ...data });
  await client.close();
};

export const insertDocument = async <T extends object>(
  data: T,
  collection: DbCollection,
): Promise<{ id: string }> => {
  console.log(`Connecting to db ${MONGODB_URL} with ${MONGO_DB_USERNAME} user...`);
  const id = uuidv4();
  const client = getClient();
  await client.connect();
  console.log(`Inserting new item in ${collection}...`);
  await client
    .db('shop.app.orders.db')
    .collection(collection)
    .insertOne({ id, ...data });
  await client.close();
  return { id };
};
