import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import { OrderFlow } from '../model/orders-model';

const { MESSAGE_BROKER_URL } = process.env;

let channel: amqp.Channel | null = null;

(async () => {
  await initPublisher();
})();

const MESSAGE_BROKER_RECONNECT_DELAY = 10000;
let exiting = false;

async function initPublisher() {
  try {
    const connection = await connect();
    channel = await connection.createChannel();

    connection.on('close', () => {
      if (exiting) return;
      console.log('Message broker connection closed. Reconnecting...');
      setTimeout(() => {
        initPublisher();
      }, MESSAGE_BROKER_RECONNECT_DELAY);
    });

    connection.on('error', (err) => {
      console.error('Error occurred on message broker connection', err);
    });

    process.on('exit', async () => {
      exiting = true;
      console.log('app terminating, closing connection to message broker');
      channel?.close();
      connection.close();
    });
    return true;
  } catch (error) {
    console.error(
      `Error while initializing publisher. Will retry in ${MESSAGE_BROKER_RECONNECT_DELAY} msec`,
      error,
    );
    setTimeout(() => {
      initPublisher();
    }, MESSAGE_BROKER_RECONNECT_DELAY);
    return false;
  }
}

async function connect() {
  console.log(`Connecting to ${MESSAGE_BROKER_URL} message broker..`);

  const connection = await amqp.connect(MESSAGE_BROKER_URL!, {});

  console.log('Connected to message broker!');
  return connection;
}

const ensureQueueExchangeBinding = async (
  exchange: string,
  queue: string,
  routingKey: string,
  channel: amqp.Channel,
) => {
  console.log(
    `Ensuring ${exchange} exchange and ${queue} queue binding through ${routingKey} routing key configured...`,
  );
  await channel.assertExchange(exchange, 'direct', { durable: true });
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, routingKey);
};

/**
 * Sends a message to the specified exchange using the provided flow, message, and optional exchange.
 * @param flow The order flow.
 * @param message The message to be sent.
 * @param exchange The exchange to send the message to. Default value is 'orders.events'.
 * @returns A promise that resolves when the message is sent successfully.
 */
export const sendMessage = async (
  flow: OrderFlow,
  message: any,
  exchange: string = 'orders.events',
): Promise<void> => {
  if (channel == null && !(await initPublisher())) {
    console.log('Error while initializing publisher, message not sent');
    return;
  }

  const queue = `orders.queue.${flow}`;
  const routingKey = flow;

  await ensureQueueExchangeBinding(exchange, queue, routingKey, channel!);

  console.log(`Publishing message to "${exchange}" exchange using "${routingKey}" routing key`);

  await channel!.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
    messageId: uuidv4(),
  });

  console.log('Message published');
};
