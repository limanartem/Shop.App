import amqp from 'amqplib';
import { Worker } from 'worker_threads';
import path from 'path';

const { MESSAGE_BROKER_URL } = process.env;

(async () => {
  console.log(`Connecting to ${MESSAGE_BROKER_URL} message broker..`);
  const connection = await amqp.connect(MESSAGE_BROKER_URL!);
  const channel = await connection.createChannel();
  console.log(`Connected to message broker!`);
  channel.prefetch(10);
  const queue = 'orders.new';

  process.once('SIGINT', async () => {
    console.log('got sigint, closing connection');
    await channel.close();
    await connection.close();
    process.exit(0);
  });

  await channel.assertQueue(queue, { durable: true });
  await channel.consume(
    queue,
    async (message) => {
      console.log(`Order received, messageId: ${message.properties.messageId}.`);
      const data = JSON.parse(Buffer.from(message.content).toString());
      new Worker(path.join(__dirname, 'workers/order-worker.js'), {
        workerData: { ...data },
      }).on('message', async (workerData) => {
        console.log(`Order processed for messageId ${message.properties.messageId}!`);
        console.log({ message: workerData });
        await channel.ack(message);
      });
    },
    {
      noAck: false,
      consumerTag: 'orders_consumer',
    },
  );
})();
