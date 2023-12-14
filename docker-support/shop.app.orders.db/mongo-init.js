console.log(`Initializing ${process.env.MONGO_INITDB_DATABASE}`, process.env);


//rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'host.docker.internal:27017' }] });

console.log('Replica set rs0 initialized');

db.createUser({
  user: process.env.MONGO_ROOT_USERNAME,
  pwd: process.env.MONGO_ROOT_PASSWORD,
  roles: [],
});

console.log('Root user created');

db = db.getSiblingDB('admin');
db.auth(process.env.MONGO_ROOT_USERNAME, process.env.MONGO_ROOT_PASSWORD);

db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE);
db.createUser({
  user: process.env.MONGO_DB_USERNAME,
  pwd: process.env.MONGO_DB_PASSWORD,
  roles: [
    {
      role: 'readWrite',
      db: process.env.MONGO_INITDB_DATABASE,
    },
  ],
});

console.log(`User "${process.env.MONGO_DB_USERNAME}" created`);

db.createUser({
  user: process.env.MONGO_DB_READ_USERNAME,
  pwd: process.env.MONGO_DB_READ_PASSWORD,
  roles: [
    {
      role: 'read',
      db: process.env.MONGO_INITDB_DATABASE,
    },
  ],
});

console.log(`User "${process.env.MONGO_DB_READ_USERNAME}" created`);

db.createCollection('customers');
db.createCollection('orders');
db.orders.createIndex({ userId: 1 });
db.createCollection('payments');
db.createCollection('shipments');

console.log('Collections created');
