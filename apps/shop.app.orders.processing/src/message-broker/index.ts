import { Worker } from 'worker_threads';
import path from 'path';
import { WorkerResultPayload } from '../model';
import * as messaging from '@shop.app/lib.messaging';

const { MESSAGE_BROKER_URL, WORKER_TYPE } = process.env;

/**
 * Starts listening for messages from the message broker and processes them.
 * @returns {Promise<void>} A promise that resolves when the listening is started.
 */
export default async function startListening() {
  if (MESSAGE_BROKER_URL == null) {
    console.error('No message broker url provided. Exiting...');
    return;
  }

  await messaging.initChannel(MESSAGE_BROKER_URL, onConnected);
}

async function onConnected() {
  const queue = `orders.queue.${WORKER_TYPE}`;
  const workerFile = `order-worker-${WORKER_TYPE}.js`;
  const exchange = 'orders.events';
  const routingKey = WORKER_TYPE!;

  await messaging.consume(
    { queue, routingKey, exchange },
    async (message, ack, reject) => {
      if (message == null) {
        return;
      }

      console.log(`Order received, messageId: ${message.properties.messageId}.`);
      const data = JSON.parse(Buffer.from(message.content).toString());
      new Worker(path.join(__dirname, `../workers/${workerFile}`), {
        workerData: { ...data },
      }).on('message', async (result: WorkerResultPayload) => {
        console.log(`Order processed for messageId ${message.properties.messageId}!`);
        console.log({ message: result });

        if (result.status === 'success') {
          await ack(message);
        } else {
          await reject(message, true);
        }
      });
    },
    {
      noAck: false,
      consumerTag: 'orders_consumer',
    },
  );
}
