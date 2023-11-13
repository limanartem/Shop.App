import express from 'express';
import { createOrder } from '../data-utils';
import { SessionRequest, middleware, errorHandler } from 'supertokens-node/framework/express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { OrderRequestPayload, OrderRequestPayloadSchema } from '../model';
import { StatusCodes } from 'http-status-codes';
import assign from 'lodash.assign';
import pick from 'lodash.pick';
import keys from 'lodash.keys';
import Joi from 'joi';

export const routerFactory = () => {
  const router = express.Router();

  router.post('/orders', verifySession(), async (req: SessionRequest, res) => {
    const userId = req.session.getUserId();
    const payload = Joi.attempt(req.body, OrderRequestPayloadSchema, {
      stripUnknown: true,
    }) as OrderRequestPayload;
    const newOrder = await createOrder(userId, payload);

    /* await sendMessage('orders.new', 'orders.events', 'orders.new', {
    data: {
      userId: 1234,
    },
  });
*/
    res.status(StatusCodes.CREATED).json(newOrder);
  });

  return router;
};
