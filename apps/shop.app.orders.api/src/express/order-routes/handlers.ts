import type { Response } from 'express';
import { createOrder, getOrdersExpanded, getProductDetails, updateOrder } from '../../data-utils';
import { SessionRequest } from 'supertokens-node/framework/express';
import { CreateOrderRequest, Order, CreateOrderRequestPayloadSchema } from '../../model';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import { sendMessage } from '../../amqp-utils';
import {
  OrderFlow,
  Status,
  UpdateOrderStatusRequest,
  UpdateOrderStatusRequestPayloadSchema,
} from '../../model/orders-model';

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

export async function putOrderHandler(req: SessionRequest, res: Response) {
  if (req.body == null) {
    throw new Error('Invalid order payload');
  }

  const orderId = req.params.id;

  if (!orderId) {
    throw new Error('Invalid order id');
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

export async function getOrdersHandler(req: SessionRequest, res: Response) {
  if (req.session == null) {
    throw new Error('Undefined session');
  }

  const userId = req.session.getUserId();

  const orders = await getOrdersExpanded(userId);

  await Promise.all(
    orders.map(async (order) => {
      const productIds = order.items?.map((i) => i.productId);
      try {
        const products = await getProductDetails(productIds);
        order.items?.forEach((item) => {
          item.product = products.find((p) => p.id === item.productId);
        });
      } catch (error) {
        console.error('Error fetching product details', error, productIds);
      }
    }),
  );

  res.json({ orders });
}

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
