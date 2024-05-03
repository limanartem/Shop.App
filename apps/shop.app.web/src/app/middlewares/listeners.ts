import { createListenerMiddleware } from '@reduxjs/toolkit';
import { placeOrder, resetCheckout } from '../reducers/checkOutReducer';
import {
  clearCart,
  addToCart,
  removeFromCart,
  merge,
  addToRemoteCart,
  removeFromRemoteCart,
  deleteRemoteCart,
} from '../reducers/shoppingCartReducer';
import { setUser } from '../reducers/authReducer';
import { graphQlWsClient } from '../../services';
import { setChangedOrders } from '../reducers/notificationsReducer';
import { RootState } from '../store';

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
  [addToCart, removeFromCart, clearCart].map((cartAction) => {
    const middleware = createListenerMiddleware();
    middleware.startListening({
      actionCreator: cartAction,
      effect: async (action, listenerApi) => {
        listenerApi.dispatch(resetCheckout());

        const isLoggedIn = (listenerApi.getState() as RootState).auth.user != null;
        if (isLoggedIn) {
          switch (action.type) {
            case addToCart.type:
              await listenerApi.dispatch(addToRemoteCart(action.payload));
              break;
            case removeFromCart.type:
              await listenerApi.dispatch(removeFromRemoteCart(action.payload));
              break;
            case clearCart.type:
              await listenerApi.dispatch(deleteRemoteCart());
              break;
          }
        }
      },
    });
    return middleware.middleware;
  });

/**
 * Creates an authentication middleware.
 * @returns The authentication middleware.
 */
const authMiddleware = () => {
  const middleware = createListenerMiddleware();
  middleware.startListening({
    actionCreator: setUser,
    effect: async (action, listenerApi) => {
      if (action.payload == null) {
        await graphQlWsClient.stopListening();
        listenerApi.dispatch(clearCart());
      } else {
        await graphQlWsClient.startListening((ids) => {
          listenerApi.dispatch(setChangedOrders(ids));
        });

        if (action.payload.hasSignedIn === true) {
          listenerApi.dispatch(merge({ getState: listenerApi.getState as () => RootState }));
        }
      }
    },
  });
  return middleware.middleware;
};

const middlewares = [
  ...shoppingCartUpdatesMiddleware(),
  checkOutCompleteMiddleware(),
  authMiddleware(),
];
export default middlewares;
