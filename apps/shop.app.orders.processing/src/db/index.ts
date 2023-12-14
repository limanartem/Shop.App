import {
  MongoClient,
  ServerApiVersion,
  Document,
  ChangeStreamInsertDocument,
  ChangeStreamUpdateDocument,
} from 'mongodb';

enum DB_COLLECTION {
  ORDERS = 'orders',
  PAYMENT = 'payment',
}

const { MONGODB_URL, MONGO_DB_USERNAME, MONGO_DB_PASSWORD } = process.env;
const CONNECT_DB_WATCH_RETRY_DELAY = 5000;

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

/**
 * Streams events from the database collection and listens for updates to the "ORDERS" collection.
 *
 * @returns A Promise that resolves to void.
 */
export default async function streamEvents(): Promise<void> {
  try {
    console.log(`Connecting to db ${MONGODB_URL} with ${MONGO_DB_USERNAME} user...`);
    const client = getClient();
    await client.connect();
    console.log(`Starting watching for updates to "${DB_COLLECTION.ORDERS}" collection...`);

    client
      .db()
      .collection(DB_COLLECTION.ORDERS)
      .watch<
        Document & { status: string },
        | ChangeStreamInsertDocument<Document & { status: string }>
        | ChangeStreamUpdateDocument<Document & { status: string }>
      >([{ $match: { operationType: { $in: ['insert', 'update'] } } }])
      .on('change', handleOrderChange)
      .on('error', handleWatchError)
      .on('close', handleWatchClose);
  } catch (error) {
    console.error(
      `Error while watching for updates to orders collection. Will retry in ${CONNECT_DB_WATCH_RETRY_DELAY} milliseconds`,
      error,
    );
    return new Promise((resolve) => setTimeout(resolve, CONNECT_DB_WATCH_RETRY_DELAY)).then(() =>
      streamEvents(),
    );
  }
}

function handleOrderChange(
  change:
    | ChangeStreamInsertDocument<Document & { status: string }>
    | ChangeStreamUpdateDocument<Document & { status: string }>,
) {
  console.log('Order updated!');
  const changeSet = getChangeSet(change);
  // TODO: for now do nothing with the change set, just logging it
  console.log({ changeSet });
}

function handleWatchError(error: any) {
  console.error('Error while watching for updates to orders collection', error);
}

function handleWatchClose() {
  console.log('Connection to db closed. Reconnecting...');
  setTimeout(() => {
    streamEvents();
  }, CONNECT_DB_WATCH_RETRY_DELAY);
}

function getChangeSet(
  change:
    | ChangeStreamInsertDocument<Document & { status: string }>
    | ChangeStreamUpdateDocument<Document & { status: string }>,
) {
  switch (change.operationType) {
    case 'insert':
      return {
        id: change.fullDocument?._id.toHexString(),
        status: change.fullDocument?.status,
        operationType: change.operationType,
      };
    case 'update':
      return {
        id: change.documentKey._id.toHexString(),
        status: change.updateDescription?.updatedFields?.status,
        operationType: change.operationType,
      };
    default:
      return null;
  }
}
