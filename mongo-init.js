db = db.getSiblingDB('shop.app.orders.db');
db.createUser({
  user: 'ordersWriteUser',
  pwd: 'qwerty123',
  roles: [
    {
      role: 'readWrite',
      db: 'orders',
    },
  ],
});

db.createCollection('customers');
db.createCollection('orders').createIndex({ userId: 1 });
db.createCollection('payments');
db.createCollection('shipments');
