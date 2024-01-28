import streamEvents from './db';
import startListening from './message-broker';
import { userInfo } from 'os';

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
  console.log(`📩  Starting process under "${userInfo().username}" user context`);
  await Promise.allSettled([startListening(), streamEvents()]);
})();

const closeGracefully = async (signal: string) => {
  console.log(`🚪  Received signal to terminate: ${signal}.`);
  process.exit();
};

process.on('SIGINT', closeGracefully);
process.on('SIGTERM', closeGracefully);
