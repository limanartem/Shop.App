import type { Response } from 'express';
import { createOrder, getOrderExpanded, getOrdersExpanded, updateOrder } from '../../domain/orders';
import { SessionRequest } from 'supertokens-node/framework/express';
import { CreateOrderRequest, Order, CreateOrderRequestPayloadSchema } from '../../model';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import { sendMessage } from '../../utils/amqp';
import {
  OrderFlow,
  Status,
  UpdateOrderStatusRequest,
  UpdateOrderStatusRequestPayloadSchema,
} from '../../model/orders-model';
import { ORDER_CHANGED, pubsub } from '../graphql/resolvers';
import { WithId } from 'mongodb';

const getOrderFlow = (status: Status): OrderFlow | null => {
  switch (status) {
    case 'pending':
      return 'pending';
    case 'confirmed':
      return 'payment';
    case 'paid':
      return 'dispatch';
    default:
      return null;
  }
};

/**
 * Handles the PUT request for updating an order item.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns A Promise that resolves to the updated order item payload.
 * @throws Error if the order payload is invalid, or if the order id or product id is invalid.
 */
export async function putOrderItemHandler(req: SessionRequest, res: Response) {
  if (req.body == null) {
    throw new Error('Invalid order payload');
  }

  const orderId = req.params.id;
  const productId = req.params.productId;

  if (!orderId) {
    throw new Error('Invalid order id');
  }

  if (!productId) {
    throw new Error('Invalid product id');
  }

  const payload = Joi.attempt(req.body, UpdateOrderStatusRequestPayloadSchema, {
    stripUnknown: true,
  }) as UpdateOrderStatusRequest;

  await updateOrder(orderId, {
    ...payload,
    updatedAt: new Date(),
    updatedBy: req.session?.getUserId()!,
  });

  const orderFlow = getOrderFlow(payload.status);

  if (orderFlow) {
    // Fire and forget
    sendMessage(orderFlow, {
      data: {
        orderId: orderId,
      },
    });
  } else {
    console.log(`No flow defined for order status ${payload.status}`);
  }
  res.status(StatusCodes.OK).json(payload);
}

/**
 * Handles the PUT request for updating an order.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns A JSON response with the updated order payload.
 * @throws Error if the order payload is invalid, the order id is invalid, or the user id is invalid.
 */
export async function putOrderHandler(req: SessionRequest, res: Response) {
  if (req.body == null) {
    throw new Error('Invalid order payload');
  }

  const orderId = req.params.id;

  if (!orderId) {
    throw new Error('Invalid order id');
  }

  const userId = req.session?.getUserId();

  if (userId == null) {
    throw new Error('Invalid user id');
  }

  const payload = Joi.attempt(req.body, UpdateOrderStatusRequestPayloadSchema, {
    stripUnknown: true,
  }) as UpdateOrderStatusRequest;

  const result = (await updateOrder(orderId, {
    ...payload,
    updatedAt: new Date(),
    updatedBy: userId,
  })) as WithId<Order>;

  if (result == null) {
    res.status(StatusCodes.NOT_FOUND).send(`Order with "${orderId}" was not found`);
    return;
  }

  console.log('Publishing order changed event', { id: orderId, userId: result.userId });
  pubsub.publish(ORDER_CHANGED, {
    orderChanged: { id: orderId, userId: result.userId, timestamp: new Date() },
  });

  const orderFlow = getOrderFlow(payload.status);

  if (orderFlow) {
    await sendMessage(orderFlow, {
      data: {
        orderId: orderId,
      },
    });
  } else {
    console.log(`No flow defined for order status ${payload.status}`);
  }

  res.status(StatusCodes.OK).json(payload);
}

/**
 * Retrieves the orders for a user and sends them as a JSON response.
 * @param req - The request object containing the session information.
 * @param res - The response object used to send the JSON response.
 * @throws Error if the session is undefined.
 */
export async function getOrdersHandler(req: SessionRequest, res: Response) {
  if (req.session == null) {
    throw new Error('Undefined session');
  }

  const userId = req.session.getUserId();

  const orders = await getOrdersExpanded(userId);

  res.json({ orders });
}

/**
 * Retrieves the order details for a given order ID.
 *
 * @param req - The request object containing the session information.
 * @param res - The response object used to send the order details.
 * @throws Error if the session is undefined or the order ID is invalid.
 */
export async function getOrderHandler(req: SessionRequest, res: Response) {
  if (req.session == null) {
    throw new Error('Undefined session');
  }

  const userId = req.session.getUserId();
  const orderId = req.params.id;

  if (!orderId) {
    throw new Error('Invalid order id');
  }

  const order = await getOrderExpanded(orderId, userId);

  if (order != null) {
    res.json(order);
  } else {
    res.status(StatusCodes.NOT_FOUND).send();
  }
}

/**
 * Handles the POST request for creating orders.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns A Promise that resolves to the created order.
 * @throws Error if the session is undefined or the order payload is invalid.
 */
export async function postOrdersHandler(req: SessionRequest, res: Response) {
  if (req.session == null) {
    throw new Error('Undefined session');
  }

  const userId = req.session.getUserId();

  if (req.body == null) {
    throw new Error('Invalid order payload');
  }

  const payload = Joi.attempt(req.body, CreateOrderRequestPayloadSchema, {
    stripUnknown: true,
  }) as CreateOrderRequest;

  const order: Order = {
    ...payload,
    userId,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  order.items.forEach((item) => {
    item.status = 'pending';
  });

  const newOrder = await createOrder(order);

  await sendMessage('pending', {
    data: {
      orderId: newOrder.id,
    },
  });
  res.status(StatusCodes.CREATED).json(newOrder);
}
