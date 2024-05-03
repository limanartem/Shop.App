import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { PersistentState } from '../persistance/local-storage';
import { ShoppingCartItem, ProductItem } from '@shop.app/lib.client-data/dist/model';
import { shoppingCartServiceClient } from '../../services';

interface ShoppingCartState extends PersistentState {
  items: ShoppingCartItem[];
}

const initialState: ShoppingCartState = {
  persistent: true,
  items: [],
};

export const merge = createAsyncThunk(
  '/shoppingCart/merge',
  async ({ getState }: { getState: () => RootState }) => {
    const state = getState() as RootState;
    const inputItems = state.shoppingCart.items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    return await shoppingCartServiceClient.merge({ items: inputItems });
  },
);

export const addToRemoteCart = createAsyncThunk(
  '/shoppingCart/addToRemoteCart',
  async ({ product, quantity }: ShoppingCartItem) => {
    return shoppingCartServiceClient.addToCart({ productId: product.id, quantity });
  },
);

export const removeFromRemoteCart = createAsyncThunk(
  '/shoppingCart/removeFromRemoteCart',
  async (product: ProductItem) => {
    return shoppingCartServiceClient.removeFromCart(product.id);
  },
);

export const deleteRemoteCart = createAsyncThunk('/shoppingCart/deleteRemoteCart', async () => {
  return shoppingCartServiceClient.deleteCart();
});

export const shoppingCartSlice = createSlice({
  name: 'shoppingCart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: ProductItem; quantity: number }>) => {
      if (!state.items) state.items = [];
      const { product, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.product.id === product.id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }
    },
    removeFromCart: (state, action: PayloadAction<ProductItem>) => {
      state.items = state.items.filter((item) => item.product.id !== action.payload.id);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(merge.fulfilled, (state, action) => {
      if (action.payload?.items != null) {
        state.items = action.payload.items?.map((item) => item as ShoppingCartItem);
      }
    });
  },
});

export const { addToCart, removeFromCart, clearCart } = shoppingCartSlice.actions;
export const selectItems = (state: RootState) => state.shoppingCart.items;

export default shoppingCartSlice.reducer;
