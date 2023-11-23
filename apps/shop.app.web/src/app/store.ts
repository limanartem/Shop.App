import { configureStore } from '@reduxjs/toolkit';
import ShoppingCartReducer from './reducers/shoppingCartReducer';
import SearchReducer from './reducers/searchReducer';
import CheckoutReducer from './reducers/checkOutReducer';
import CategoriesReducer from './reducers/categoriesReducer';
import AuthReducer from './reducers/authReducer';
import middlewares from './middlewares/listeners';
import { loadFromLocalStorage, saveToLocalStorage } from './persistance/local-storage';

export const buildStore = () => {
  const reduxStore = configureStore({
    reducer: {
      shoppingCart: ShoppingCartReducer,
      search: SearchReducer,
      checkout: CheckoutReducer,
      categories: CategoriesReducer,
      auth: AuthReducer,
    },
    preloadedState: loadFromLocalStorage(),
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(middlewares),
  });

  reduxStore.subscribe(() => saveToLocalStorage(reduxStore));
  return reduxStore;
};

export const store = buildStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
