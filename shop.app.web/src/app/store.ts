import { configureStore } from '@reduxjs/toolkit';
import ShoppingCartReducer from './reducers/shoppingCartReducer';

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
  },
  preloadedState: loadFromLocalStorage(),
});

store.subscribe(saveToLocalStorage);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
