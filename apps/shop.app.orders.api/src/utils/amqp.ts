import { OrderFlow } from '../model/orders-model';
import * as messaging from '@shop.app/lib.messaging';

const { MESSAGE_BROKER_URL } = process.env;

(async () => {
  await messaging.initChannel(MESSAGE_BROKER_URL!);
})();

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
  const queue = `orders.queue.${flow}`;
  const routingKey = flow;

  await messaging.sendMessage(queue, routingKey, message, exchange);
};
