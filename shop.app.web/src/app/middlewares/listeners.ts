import { createListenerMiddleware } from '@reduxjs/toolkit';
import { placeOrder, resetCheckout } from '../reducers/checkOutReducer';
import { clearCart, addToCart, removeFromCart } from '../reducers/shoppingCartReducer';

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

const middlewares = [...shoppingCartUpdatesMiddleware(), checkOutCompleteMiddleware()];
export default middlewares;
