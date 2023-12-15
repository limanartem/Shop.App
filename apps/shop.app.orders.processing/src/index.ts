import streamEvents from './db';
import startListening from './message-broker';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type OrderStatus =
  | 'pending'
  | 'inventory.confirmed'
  | 'inventory.rejected'
  | 'payment.confirmed'
  | 'payment.rejected'
  | 'shipment.dispatched'
  | 'shipment.delivered';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type WorkerType = 'pending' | 'payment' | 'dispatch';

(async () => {
  await Promise.allSettled([startListening(), streamEvents()]);
})();
