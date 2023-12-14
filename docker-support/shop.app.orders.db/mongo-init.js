if (!db.isMaster().ismaster) {
  console.log('Error: primary not ready, initialize ...');
  rs.initiate();
  quit(1);
}

// check if user with process.env.MONGO_ROOT_USERNAME name  already created

ensureUserCreated(process.env.MONGO_ROOT_USERNAME, process.env.MONGO_ROOT_PASSWORD, []);

//rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'host.docker.internal:27017' }] });

//console.log('Replica set rs0 initialized');

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
