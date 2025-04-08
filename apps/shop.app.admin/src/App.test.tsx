import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './store/slices/productsSlice';
import categoriesReducer from './store/slices/categoriesSlice';

/**
 * Type definitions for the state structure
 */
interface ProductState {
  products: Array<Record<string, unknown>>;
  loading: boolean;
  error: string | null;
  currentProduct: Record<string, unknown> | null;
}

interface CategoryState {
  categories: Array<Record<string, unknown>>;
  loading: boolean;
  error: string | null;
}

/**
 * Type definition for the root state of the Redux store
 */
interface RootState {
  products: ProductState;
  categories: CategoryState;
}

/**
 * Creates a test store for the admin app
 * @returns A configured Redux store with products and categories reducers
 */
const createTestStore = (): ReturnType<typeof configureStore> => {
  return configureStore({
    reducer: {
      products: productsReducer,
      categories: categoriesReducer
    } as const
  });
};

describe('Shop.App Admin', () => {
  test('redux store initializes correctly', () => {
    // Arrange
    const store = createTestStore();
    const state = store.getState() as RootState;
    
    // Assert
    expect(state.products).toBeDefined();
    expect(state.products.products).toEqual([]);
    expect(state.products.loading).toBe(false);
    expect(state.products.error).toBeNull();
    
    expect(state.categories).toBeDefined();
    expect(state.categories.categories).toEqual([]);
    expect(state.categories.loading).toBe(false);
    expect(state.categories.error).toBeNull();
  });
});
