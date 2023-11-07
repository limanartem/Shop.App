import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

const { MESSAGE_BROKER_URL } = process.env;

export const sendMessage = async (
  queue: string,
  exchange: string,
  routingKey: string,
  message: any,
): Promise<void> => {
  console.log(`Connecting to ${MESSAGE_BROKER_URL} message broker..`);
  const connection = await amqp.connect(MESSAGE_BROKER_URL!);
  const channel = await connection.createChannel();
  console.log(`Connected to message broker!`);
  await channel.assertExchange(exchange, 'direct', { durable: true });
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, routingKey);
  await channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
    messageId: uuidv4(),
  });
  console.log('Message published');
  console.info('Closing channel and connection if available');
  await channel.close();
  await connection.close();
  console.info('Channel and connection closed');
};
