import { createListenerMiddleware } from '@reduxjs/toolkit';
import { placeOrder, resetCheckout } from '../reducers/checkOutReducer';
import { clearCart, addToCart, removeFromCart } from '../reducers/shoppingCartReducer';

/**
 * Creates a middleware that listens for the completion of the checkout process.
 * When the "placeOrder" action is dispatched, it clears the cart.
 * @returns The middleware function.
 */
const checkOutCompleteMiddleware = () => {
  const listener = createListenerMiddleware();
  listener.startListening({
    actionCreator: placeOrder,
    effect: async (action, listenerApi) => {
      listenerApi.dispatch(clearCart());
    },
  });
  return listener.middleware;
};

/**
 * Creates a middleware that listens for shopping cart updates and dispatches a resetCheckout action.
 * @returns An array of middleware functions.
 */
const shoppingCartUpdatesMiddleware = () =>
  [addToCart, removeFromCart].map((cartAction) => {
    const middleware = createListenerMiddleware();
    middleware.startListening({
      actionCreator: cartAction,
      effect: async (action, listenerApi) => {
        listenerApi.dispatch(resetCheckout());
      },
    });
    return middleware.middleware;
  });

 

const middlewares = [
  ...shoppingCartUpdatesMiddleware(),
  checkOutCompleteMiddleware(),
];
export default middlewares;
