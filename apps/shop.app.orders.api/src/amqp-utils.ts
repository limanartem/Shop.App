import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import { OrderFlow } from './model/orders-model';

const { MESSAGE_BROKER_URL } = process.env;

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

export const sendMessage = async (
  flow: OrderFlow,
  message: any,
  exchange: string = 'orders.events',
): Promise<void> => {
  const queue = `orders.queue.${flow}`;
  const routingKey = flow;

  console.log(`Connecting to ${MESSAGE_BROKER_URL} message broker..`);
  const connection = await amqp.connect(MESSAGE_BROKER_URL!);
  const channel = await connection.createChannel();
  console.log('Connected to message broker!');
  await ensureQueueExchangeBinding(exchange, queue, routingKey, channel);

  console.log(`Publishing message to "${exchange}" exchange using "${routingKey}" routing key`);

  await channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
    messageId: uuidv4(),
  });
  
  console.log('Message published');
  console.info('Closing channel and connection if available');
  await channel.close();
  await connection.close();
  console.info('Channel and connection closed');
};
