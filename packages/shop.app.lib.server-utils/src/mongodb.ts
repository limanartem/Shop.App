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

type DB_COLLECTION = 'orders' | 'payment' | 'shopping-cart';

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

/**
 * Fetches documents from the MongoDB collection based on the provided criteria.
 *
 * @template DocumentType - The type of the documents to fetch.
 * @param criteria - The filter criteria to apply when fetching documents.
 * @param collection - The name of the MongoDB collection to fetch documents from.
 * @returns A promise that resolves to an array of fetched documents.
 */
export const fetchDocuments = async <DocumentType extends Document = Document>(
  criteria: Filter<WithId<Document>>,
  collection: DB_COLLECTION = 'orders',
): Promise<WithClearId<DocumentType>[]> =>
  usingClient(async (client) => {
    console.log('Searching items from db...', criteria, collection);
    return (
      await client.db().collection(collection).find<WithId<DocumentType>>(criteria).toArray()
    ).map(mapToClearIdDocument);
  });

/**
 * Fetches a document from the MongoDB collection based on the provided criteria.
 *
 * @param criteria - The criteria used to filter the document.
 * @param collection - The MongoDB collection to fetch the document from.
 * @returns A promise that resolves to the fetched document or null if not found.
 */
export const fetchDocument = async <DocumentType extends Document = Document>(
  criteria: Filter<WithId<Document>>,
  collection: DB_COLLECTION = 'orders',
): Promise<WithClearId<DocumentType> | null> =>
  usingClient(async (client) => {
    // const _id = ObjectId.createFromHexString(id);
    console.log(`Connecting to db ${MONGODB_URL} with ${MONGO_DB_USERNAME} user...`);
    console.log('Fetching item from db...', criteria, collection);
    const document = await client
      .db()
      .collection(collection)
      .findOne<WithId<DocumentType>>(criteria);
    if (document != null) {
      return mapToClearIdDocument<DocumentType>(document);
    }
    return null;
  });

/**
 * Updates a document in the MongoDB collection.
 *
 * @param id - The ID of the document to update.
 * @param data - The updated data to be set in the document.
 * @param collection - The MongoDB collection to update the document in. Defaults to DB_COLLECTION.ORDERS.
 * @returns A promise that resolves to the updated document with the ID, or null if the document was not found.
 */
export const updateDocument = async (
  id: string | ObjectId,
  data: any,
  collection: DB_COLLECTION = 'orders',
): Promise<WithId<Document> | null> =>
  usingClient(async (client) => {
    const _id = id instanceof ObjectId ? id : ObjectId.createFromHexString(id);
    console.log(`Connecting to db ${MONGODB_URL} with ${MONGO_DB_USERNAME} user...`);
    console.log('Updating item in db...', id, data, collection);
    const updateResult = await client
      .db()
      .collection(collection)
      .findOneAndUpdate({ _id }, { $set: data }, { returnDocument: 'after' });
    return updateResult;
  });

/**
 * Inserts a document into the specified collection in the MongoDB database.
 *
 * @template T - The type of the document being inserted.
 * @param data - The document to be inserted.
 * @param collection - The collection in which the document should be inserted. Defaults to DB_COLLECTION.ORDERS.
 * @returns A promise that resolves to an object containing the ID of the inserted document.
 */
export const insertDocument = async <T extends Document>(
  data: Partial<T>,
  collection: DB_COLLECTION = 'orders',
): Promise<{ id: ObjectId } & Partial<T>> =>
  usingClient(async (client) => {
    console.log(`Connecting to db ${MONGODB_URL} with ${MONGO_DB_USERNAME} user...`);
    console.log(`Inserting new item in ${collection} collection...`, data);
    const result = await client.db().collection(collection).insertOne(data);

    return {
      id: result.insertedId,
      ...data,
    };
  });

export const deleteDocument = async (
  criteria: Filter<WithId<Document>>,
  collection: DB_COLLECTION = 'orders',
): Promise<boolean> =>
  usingClient(async (client) => {
    console.log(`Connecting to db ${MONGODB_URL} with ${MONGO_DB_USERNAME} user...`);
    console.log('Deleting item in db...', criteria, collection);
    const result = await client.db().collection(collection).deleteOne(criteria);
    return result.deletedCount > 0;
  });
