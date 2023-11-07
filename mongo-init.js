db = db.getSiblingDB('items');
db.createUser({
  user: 'items_user',
  pwd: 'qwerty123',
  roles: [
    {
      role: 'readWrite',
      db: 'items',
    },
  ],
});

db.createCollection('customers');
db.createCollection('orders');
db.createCollection('payments');
db.createCollection('shipments');
