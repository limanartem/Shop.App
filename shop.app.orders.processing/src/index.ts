import amqp from 'amqplib';
import { Worker } from 'worker_threads';
import path from 'path';
import { WorkerResultPayload } from './model';

type OrderStatus =
  | 'pending'
  | 'inventory.confirmed'
  | 'inventory.rejected'
  | 'payment.confirmed'
  | 'payment.rejected'
  | 'shipment.dispatched'
  | 'shipment.delivered';

type WorkerType = 'pending' | 'payment' | 'dispatch';
const { MESSAGE_BROKER_URL, WORKER_TYPE } = process.env;

const queue = `orders.queue.${WORKER_TYPE}`;
const workerFile = `order-worker-${WORKER_TYPE}.js`;

(async () => {
  console.log(`Connecting to ${MESSAGE_BROKER_URL} message broker..`);
  const connection = await amqp.connect(MESSAGE_BROKER_URL!);
  const channel = await connection.createChannel();
  console.log(`Connected to message broker!`);
  channel.prefetch(10);

  process.once('SIGINT', async () => {
    console.log('got sigint, closing connection');
    await channel.close();
    await connection.close();
    process.exit(0);
  });

  const exchange = 'orders.events';
  const routingKey = WORKER_TYPE;

  console.log(
    `Ensuring ${exchange} exchange and ${queue} queue binding through ${routingKey} routing key configured...`,
  );
  await channel.assertExchange(exchange, 'direct', { durable: true });
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, routingKey);

  console.log(`Starting processing messages from ${queue} queue...`);
  await channel.assertQueue(queue, { durable: true });
  await channel.consume(
    queue,
    async (message) => {
      console.log(`Order received, messageId: ${message.properties.messageId}.`);
      const data = JSON.parse(Buffer.from(message.content).toString());
      new Worker(path.join(__dirname, `workers/${workerFile}`), {
        workerData: { ...data },
      }).on('message', async (result: WorkerResultPayload) => {
        console.log(`Order processed for messageId ${message.properties.messageId}!`);
        console.log({ message: result });
        await channel.ack(message);
      });
    },
    {
      noAck: false,
      consumerTag: 'orders_consumer',
    },
  );
  console.log(`Stopping processing messages from ${queue} queue...`);
})();
