import express from 'express';
import { createOrder, getOrders, getProductDetails, updateOrder } from '../data-utils';
import { SessionRequest } from 'supertokens-node/framework/express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { CreateOrderRequest, Order, CreateOrderRequestPayloadSchema } from '../model';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import { sendMessage } from '../amqp-utils';
import { verifyUserRole } from '../auth';
import {
  OrderFlow,
  Status,
  UpdateOrderStatusRequest,
  UpdateOrderStatusRequestPayloadSchema,
} from '../model/orders-model';

export const routerFactory = () => {
  const router = express.Router();

  router.post('/orders', verifySession(), async (req: SessionRequest, res) => {
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
  });

  router.get('/orders', verifySession(), async (req: SessionRequest, res) => {
    const userId = req.session.getUserId();

    const orders = await getOrders(userId);

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
  });

  router.put(
    '/order/:id',
    verifySession(),
    verifyUserRole('api'),
    async (req: SessionRequest, res) => {
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
        updatedBy: req.session.getUserId(),
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
    },
  );

  router.put(
    '/order/:id/items/:productId',
    verifySession(),
    verifyUserRole('api'),
    async (req: SessionRequest, res) => {
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
        updatedBy: req.session.getUserId(),
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
    },
  );

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

  return router;
};
