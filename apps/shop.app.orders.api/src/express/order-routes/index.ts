import express from 'express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { verifyUserRole } from '../../utils/auth';
import {
  postOrdersHandler,
  getOrdersHandler,
  putOrderHandler,
  putOrderItemHandler,
  getOrderHandler,
} from './handlers';

/**
 * Creates a router for handling order routes.
 * @returns The express router.
 */
export const routerFactory = () => {
  const router = express.Router();

  router
    .post('/orders', verifySession(), postOrdersHandler)
    .get('/orders', verifySession(), getOrdersHandler)
    .get('/orders/:id', verifySession(), getOrderHandler)
    .put('/order/:id', verifySession(), verifyUserRole('api'), putOrderHandler) //TODO: should be deprecated
    .put('/orders/:id', verifySession(), verifyUserRole('api'), putOrderHandler)
    .put(
      '/orders/:id/items/:productId',
      verifySession(),
      verifyUserRole('api'),
      putOrderItemHandler,
    );

  return router;
};
