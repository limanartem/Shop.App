import express from 'express';
import { createOrder } from '../data-utils';
import { SessionRequest } from 'supertokens-node/framework/express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { OrderRequestPayload, OrderRequestPayloadSchema } from '../model';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import { sendMessage } from '../amqp-utils';

export const routerFactory = () => {
  const router = express.Router();

  router.post('/orders', verifySession(), async (req: SessionRequest, res) => {
    const userId = req.session.getUserId();
    const payload = Joi.attempt(req.body, OrderRequestPayloadSchema, {
      stripUnknown: true,
    }) as OrderRequestPayload;
    const newOrder = await createOrder(userId, payload);

    await sendMessage('pending', {
      data: {
        orderId: newOrder.id,
      },
    });
    res.status(StatusCodes.CREATED).json(newOrder);
  });

  return router;
};
