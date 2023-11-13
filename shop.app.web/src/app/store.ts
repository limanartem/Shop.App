import { configureStore } from '@reduxjs/toolkit';
import ShoppingCartReducer from './reducers/shoppingCartReducer';
import SearchReducer from './reducers/searchReducer';
import CheckoutReducer from './reducers/checkOutReducer';
import { checkOutCompleteMiddleware, shoppingCartUpdatesMiddleware } from './middlewares/listeners';

const loadFromLocalStorage = () => {
  const state = localStorage.getItem('shop.app.state');
  if (state) {
    console.log('Restored from local storage', state);
    return JSON.parse(state);
  }
  return {};
};

const saveToLocalStorage = () => {
  localStorage.setItem('shop.app.state', JSON.stringify(store.getState()));
};

export const store = configureStore({
  reducer: {
    shoppingCart: ShoppingCartReducer,
    search: SearchReducer,
    checkout: CheckoutReducer,
  },
  preloadedState: loadFromLocalStorage(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(checkOutCompleteMiddleware())
      .prepend(shoppingCartUpdatesMiddleware()),
});

store.subscribe(saveToLocalStorage);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
