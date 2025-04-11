import express from 'express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { verifyUserRole } from '../../utils/auth';
import { verifyAdminRole, verifyAdminOrOwner } from '../../utils/admin-auth';
import {
  postOrdersHandler,
  getOrdersHandler,
  putOrderHandler,
  putOrderItemHandler,
  getOrderHandler,
  getAdminOrdersHandler,
  getOrderStatusHistoryHandler,
} from './handlers';
import { csrfMiddleware } from '../csrf';

/**
 * Creates a router for handling order routes.
 * @returns The express router.
 */
export const routerFactory = () => {
  const router = express.Router();

  // Customer-facing order routes
  router
    // Create a new order
    .post('/orders', verifySession(), postOrdersHandler)
    .post('/orders-csrf', verifySession(), csrfMiddleware, postOrdersHandler)
    
    // Get customer's own orders
    .get('/orders', verifySession(), getOrdersHandler)
    
    // Get a specific order (with owner verification)
    .get('/orders/:id', verifySession(), 
      verifyAdminOrOwner((req) => {
        const orderId = req.params.id;
        // The actual implementation would fetch the order and return its userId
        // This is a placeholder that will be replaced with actual implementation
        return req.session!.getUserId();
      }),
      getOrderHandler
    )
    
    // Get order status history (admin or owner)
    .get('/orders/:id/history', verifySession(),
      verifyAdminOrOwner((req) => {
        const orderId = req.params.id;
        // The actual implementation would fetch the order and return its userId
        // This is a placeholder that will be replaced with actual implementation
        return req.session!.getUserId();
      }),
      getOrderStatusHistoryHandler
    );

  // Admin-only order management routes
  router
    // Get all orders (admin only)
    .get('/admin/orders', verifySession(), verifyAdminRole(), getAdminOrdersHandler)
    
    // Update order status (admin only)
    .put('/orders/:id/status', verifySession(), verifyAdminRole(), putOrderHandler)
    
    // Legacy route - should be deprecated
    .put('/order/:id', verifySession(), verifyAdminRole(), putOrderHandler)
    
    // Update order item status (admin only)
    .put(
      '/orders/:id/items/:productId',
      verifySession(),
      verifyAdminRole(),
      putOrderItemHandler
    );

  return router;
};
