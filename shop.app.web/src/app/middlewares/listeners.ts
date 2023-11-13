import { createListenerMiddleware } from '@reduxjs/toolkit';
import { placeOrder, reset } from '../reducers/checkOutReducer';
import { clearCart, addToCart, removeFromCart } from '../reducers/shoppingCartReducer';

export const checkOutCompleteMiddleware = () => {
  const listener = createListenerMiddleware();
  listener.startListening({
    actionCreator: placeOrder,
    effect: async (action, listenerApi) => {
      listenerApi.dispatch(clearCart());
    },
  });
  return listener.middleware;
};

export const shoppingCartUpdatesMiddleware = () =>
  [addToCart, removeFromCart].map((cartAction) => {
    const middleware = createListenerMiddleware();
    middleware.startListening({
      actionCreator: cartAction,
      effect: async (action, listenerApi) => {
        listenerApi.dispatch(reset());
      },
    });
    return middleware.middleware;
  });
