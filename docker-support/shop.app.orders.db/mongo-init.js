/**
 * Initializes the MongoDB replication set and creates necessary users and collections.
 * Previously this script was triggered during db initialization via placing it to /docker-entrypoint-initdb.d,
 * but since migration from standalone MongoDB to MongoDB replica set, it is not possible to run this script when the container starts.
 *  therefore it runs as part of healthcheck script, see  https://github.com/docker-library/mongo/issues/339#issuecomment-485578503:
 *  "
 *      The docker-entrypoint-initdb.d scripts run during an initialization period (and only if the database is empty),
 *      during which the  container is only listening on localhost so trying to initiate a cluster during that period isn't
 *      possible as it won't resolve it's own container hostname.
 *  "
 * If the primary is not ready, it attempts to initialize the replication set.
 * It checks if the specified users are already created and creates them if necessary.
 * It also checks if the "orders" collection is already created and creates it if necessary.
 * @param {string} process.env.MONGO_ROOT_USERNAME - The username for the root user.
 * @param {string} process.env.MONGO_ROOT_PASSWORD - The password for the root user.
 * @param {string} process.env.MONGO_DB_USERNAME - The username for the database user.
 * @param {string} process.env.MONGO_DB_PASSWORD - The password for the database user.
 * @param {string} process.env.MONGO_DB_READ_USERNAME - The username for the read-only database user.
 * @param {string} process.env.MONGO_DB_READ_PASSWORD - The password for the read-only database user.
 * @param {string} process.env.MONGO_INITDB_DATABASE - The name of the database.
 */

const { MONGO_DB_INIT_RS = 'true' } = process.env;

if (MONGO_DB_INIT_RS === 'true') {
  const { ismaster } = db.isMaster();
  if (!ismaster) {
    console.log('Primary is not ready, initialize replication set ...');
    try {
      // TODO: read rs config from external file
      rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'host.docker.internal:27017' }] });
    } catch (err) {
      console.error('Error during rs.initiate', err);
    }
    quit(1);
  }
}
ensureUserCreated(process.env.MONGO_ROOT_USERNAME, process.env.MONGO_ROOT_PASSWORD, []);

//db = db.getSiblingDB('admin');
//db.auth(process.env.MONGO_ROOT_USERNAME, process.env.MONGO_ROOT_PASSWORD);

db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE);

ensureUserCreated(process.env.MONGO_DB_USERNAME, process.env.MONGO_DB_PASSWORD, [
  {
    role: 'readWrite',
    db: process.env.MONGO_INITDB_DATABASE,
  },
]);

ensureUserCreated(process.env.MONGO_DB_READ_USERNAME, process.env.MONGO_DB_READ_PASSWORD, [
  {
    role: 'read',
    db: process.env.MONGO_INITDB_DATABASE,
  },
]);

// Check if collection was created and if not create it
if (!db.getCollectionNames().includes('orders')) {
  db.createCollection('orders');
  db.orders.createIndex({ userId: 1 });
  console.log('Collection orders created');
} else {
  console.log('Collection orders already exists');
}

quit(0);

/**
 * Ensures that a user is created in the database with the specified credentials and roles.
 * If the user already exists, it logs a message indicating that the user is already created.
 * @param {string} userName - The name of the user to be created.
 * @param {string} password - The password for the user.
 * @param {string[]} roles - An array of roles assigned to the user.
 */
function ensureUserCreated(userName, password, roles) {
  if (!db.getUser(userName)) {
    db.createUser({
      user: userName,
      pwd: password,
      roles: roles,
    });
    console.log(`User "${userName}" created`);
  } else {
    console.log(`User "${userName}" already created`);
  }
}
