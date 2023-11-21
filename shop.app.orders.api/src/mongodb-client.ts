import {
  MongoClient,
  ServerApiVersion,
  WithId,
  Document,
  ObjectId,
  EnhancedOmit,
  InferIdType,
} from 'mongodb';

const { MONGODB_URL, MONGO_DB_USERNAME, MONGO_DB_PASSWORD } = process.env;

export declare type WithClearId<TSchema> = WithId<TSchema> &
  EnhancedOmit<TSchema, '_id'> & {
    id: InferIdType<TSchema>;
  };

enum DB_COLLECTION {
  ORDERS = 'orders',
  PAYMENT = 'payment',
}
const getClient = () =>
  new MongoClient(MONGODB_URL!, {
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

const usingClient = async <TResult>(
  action: (client: MongoClient) => Promise<TResult>,
): Promise<TResult> => {
  console.log(`Connecting to db ${MONGODB_URL} with ${MONGO_DB_USERNAME} user...`);
  const client = getClient();
  await client.connect();
  try {
    return await action(client);
  } finally {
    await client.close();
  }
};

const mapToClearIdDocument = <DocumentType extends Document = Document>(
  document: WithId<DocumentType>,
): WithClearId<DocumentType> => ({
  id: document._id,
  ...document,
});

export const fetchDocuments = async <DocumentType extends Document = Document>(
  criteria: any,
  collection: DB_COLLECTION = DB_COLLECTION.ORDERS,
): Promise<WithClearId<DocumentType>[]> =>
  usingClient(async (client) => {
    console.log('Searching items from db...', criteria, collection);
    return (
      await client.db().collection(collection).find<WithId<DocumentType>>(criteria).toArray()
    ).map(mapToClearIdDocument);
  });

export const fetchDocument = async (
  id: string,
  collection: DB_COLLECTION = DB_COLLECTION.ORDERS,
): Promise<WithClearId<Document> | null> =>
  usingClient(async (client) => {
    const _id = ObjectId.createFromHexString(id);
    console.log(`Connecting to db ${MONGODB_URL} with ${MONGO_DB_USERNAME} user...`);
    console.log('Fetching item from db...', id, collection);
    const order = await client.db().collection(collection).findOne({ _id });
    if (order != null) {
      return mapToClearIdDocument(order);
    }
    return null;
  });

export const updateDocument = async <T extends object>(
  id: string,
  data: T,
  collection: DB_COLLECTION = DB_COLLECTION.ORDERS,
): Promise<void> =>
  usingClient(async (client) => {
    const _id = ObjectId.createFromHexString(id);
    console.log(`Connecting to db ${MONGODB_URL} with ${MONGO_DB_USERNAME} user...`);
    console.log('Updating item in db...', id, data, collection);
    await client.db().collection(collection).updateOne({ _id }, { $set: data });
  });

export const insertDocument = async <T extends object>(
  data: T,
  collection: DB_COLLECTION = DB_COLLECTION.ORDERS,
): Promise<{ id: string }> =>
  usingClient(async (client) => {
    console.log(`Connecting to db ${MONGODB_URL} with ${MONGO_DB_USERNAME} user...`);
    console.log(`Inserting new item in ${collection} collection...`, data);
    const result = await client.db().collection(collection).insertOne(data);

    return { id: result.insertedId.toString() };
  });
