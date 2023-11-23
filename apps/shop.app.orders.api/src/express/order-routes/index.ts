import express from 'express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { verifyUserRole } from '../../auth';
import {
  postOrdersHandler,
  getOrdersHandler,
  putOrderHandler,
  putOrderItemHandler,
} from './handlers';

export const routerFactory = () => {
  const router = express.Router();

  router
    .post('/orders', verifySession(), postOrdersHandler)
    .get('/orders', verifySession(), getOrdersHandler)
    .put('/order/:id', verifySession(), verifyUserRole('api'), putOrderHandler)
    .put(
      '/order/:id/items/:productId',
      verifySession(),
      verifyUserRole('api'),
      putOrderItemHandler,
    );

  return router;
};