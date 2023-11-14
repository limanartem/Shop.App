console.log('Initializing database', process.env);

db = db.getSiblingDB('admin');
db.auth(
    process.env.MONGO_INITDB_ROOT_USERNAME,
    process.env.MONGO_INITDB_ROOT_PASSWORD,
);

db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE);
db.createUser({
    user: process.env.MONGO_DB_USERNAME,
    pwd: process.env.MONGO_DB_PASSWORD,
    roles: [{
        role: 'readWrite',
        db: process.env.MONGO_INITDB_DATABASE,
    }]
});

db.createCollection('customers');
db.createCollection('orders');
db.orders.createIndex({ userId: 1 });
db.createCollection('payments');
db.createCollection('shipments');
