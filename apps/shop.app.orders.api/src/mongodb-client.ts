import {
  MongoClient,
  ServerApiVersion,
  WithId,
  Document,
  ObjectId,
  EnhancedOmit,
  InferIdType,
  Filter,
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
  criteria: Filter<WithId<Document>>,
  collection: DB_COLLECTION = DB_COLLECTION.ORDERS,
): Promise<WithClearId<DocumentType>[]> =>
  usingClient(async (client) => {
    console.log('Searching items from db...', criteria, collection);
    return (
      await client.db().collection(collection).find<WithId<DocumentType>>(criteria).toArray()
    ).map(mapToClearIdDocument);
  });

export const fetchDocument = async <DocumentType extends Document = Document>(
  criteria: Filter<WithId<Document>>,
  collection: DB_COLLECTION = DB_COLLECTION.ORDERS,
): Promise<WithClearId<DocumentType> | null> =>
  usingClient(async (client) => {
    // const _id = ObjectId.createFromHexString(id);
    console.log(`Connecting to db ${MONGODB_URL} with ${MONGO_DB_USERNAME} user...`);
    console.log('Fetching item from db...', criteria, collection);
    const order = await client.db().collection(collection).findOne<WithId<DocumentType>>(criteria);
    if (order != null) {
      return mapToClearIdDocument<DocumentType>(order);
    }
    return null;
  });

export const updateDocument = async (
  id: string,
  data: any,
  collection: DB_COLLECTION = DB_COLLECTION.ORDERS,
): Promise<WithId<Document> | null> =>
  usingClient(async (client) => {
    const _id = ObjectId.createFromHexString(id);
    console.log(`Connecting to db ${MONGODB_URL} with ${MONGO_DB_USERNAME} user...`);
    console.log('Updating item in db...', id, data, collection);
    const updateResult = await client
      .db()
      .collection(collection)
      .findOneAndUpdate({ _id }, { $set: data }, {});
    return updateResult;
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
