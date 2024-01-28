import amqp, { ConsumeMessage, Options } from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

let channel: amqp.Channel | null = null;
let exiting = false;

const MESSAGE_BROKER_RECONNECT_DELAY = 10000;

/**
 * Represents a binding configuration for a message queue.
 */
interface QueueBinding {
  queue: string;
  routingKey: string;
  exchange: string;
}

/**
 * Initializes the message broker channel.
 *
 * @param messageBrokerUrl - The URL of the message broker.
 * @param onConnected - Optional callback function to be executed when the connection is established.
 * @returns A promise that resolves to `true` if the channel is successfully initialized, otherwise `false`.
 */
export async function initChannel(
  messageBrokerUrl: string,
  onConnected?: () => void | Promise<void>,
) {
  try {
    const connection = await connect(messageBrokerUrl);
    channel = await connection.createChannel();

    connection.on('close', () => {
      if (exiting) return;
      console.log('Message broker connection closed. Reconnecting...');
      setTimeout(() => {
        initChannel(messageBrokerUrl, onConnected);
      }, MESSAGE_BROKER_RECONNECT_DELAY);
    });

    connection.on('error', (err) => {
      console.error('Error occurred on message broker connection', err);
    });

    process.on('exit', () => {
      exiting = true;
      console.log('App terminating, closing connection to message broker');
      channel?.close();
      connection.close();
    });

    try {
      await onConnected?.();
    } catch (e) {
      console.error('Error while executing onConnected callback', e);
    }

    return true;
  } catch (error) {
    console.error(
      `Error while initializing message broker. Will retry in ${MESSAGE_BROKER_RECONNECT_DELAY} msec`,
      error,
    );
    setTimeout(() => {
      initChannel(messageBrokerUrl, onConnected);
    }, MESSAGE_BROKER_RECONNECT_DELAY);
    return false;
  }
}

async function connect(messageBrokerUrl: string) {
  console.log(`Connecting to ${messageBrokerUrl} message broker..`);

  const connection = await amqp.connect(messageBrokerUrl!, {});

  console.log('Connected to message broker!');
  return connection;
}

const ensureQueueExchangeBinding = async (
  { queue, routingKey, exchange }: QueueBinding,
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
 * Sends a message to a specified queue using the provided queue binding information.
 * @param queueBinding The queue binding information including the queue, routing key, and exchange.
 * @param message The message to be sent.
 * @returns A promise that resolves when the message is sent successfully, or rejects with an error if there was an issue.
 */
export const sendMessage = async (
  { queue, routingKey, exchange }: QueueBinding,
  message: any,
): Promise<void> => {
  if (channel == null) {
    console.log('Error while initializing message broker, message not sent');
    return;
  }

  await ensureQueueExchangeBinding({ exchange, queue, routingKey }, channel!);

  console.error(`Publishing message to "${exchange}" exchange using "${routingKey}" routing key`);

  await channel!.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
    messageId: uuidv4(),
  });

  console.log('Message published');
};

/**
 * Consume messages from a queue.
 *
 * @param queue - The name of the queue to consume from.
 * @param routingKey - The routing key for the queue binding.
 * @param exchange - The name of the exchange for the queue binding.
 * @param onMessage - A callback function that will be called for each consumed message.
 * @param options - Optional consume options.
 */
export async function consume(
  { queue, routingKey, exchange }: QueueBinding,
  onMessage: (
    msg: ConsumeMessage | null,
    ack: (msg: ConsumeMessage) => void | Promise<void>,
    reject: (msg: ConsumeMessage, requeue?: boolean) => void | Promise<void>,
  ) => void,
  options?: Options.Consume,
) {
  if (channel == null) {
    console.error('Error while initializing message broker, not able to consume messages');
    return;
  }

  await ensureQueueExchangeBinding({ exchange, queue, routingKey }, channel!);
  console.log(`Starting processing messages from ${queue} queue...`);
  await channel.assertQueue(queue, { durable: true });
  await channel.consume(
    queue,
    (msg) => {
      if (channel == null) {
        console.error('Error while consuming message. Channel is not initialized.');
        return;
      }

      onMessage(msg, channel.ack.bind(channel), channel.reject.bind(channel));
    },
    options,
  );
}
