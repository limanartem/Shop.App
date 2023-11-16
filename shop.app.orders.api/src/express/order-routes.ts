import express from 'express';
import { createOrder, getOrders, getProductDetails } from '../data-utils';
import { SessionRequest } from 'supertokens-node/framework/express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { CreateOrderRequest, Order, OrderRequestPayloadSchema } from '../model';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import { sendMessage } from '../amqp-utils';

export const routerFactory = () => {
  const router = express.Router();

  router.post('/orders', verifySession(), async (req: SessionRequest, res) => {
    try {
      const userId = req.session.getUserId();
      const payload = Joi.attempt(req.body, OrderRequestPayloadSchema, {
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
    } catch (error) {
      console.log(error);
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
  });

  router.get('/orders', verifySession(), async (req: SessionRequest, res) => {
    try {
      const userId = req.session.getUserId();

      const orders = await getOrders(userId);

      await Promise.all(
        orders.map(async (order) => {
          const productIds = order.items.map((i) => i.productId);
          const products = await getProductDetails(productIds);
          order.items.forEach((item) => {
            item.product = products.find((p) => p.id === item.productId);
          });
        }),
      );

      res.json({ orders });
    } catch (error) {
      console.log(error);
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
  });

  return router;
};
