import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { PersistentState } from '../persistance/local-storage';
import { ShoppingCartItem, ProductItem } from '@shop.app/lib.client-data/dist/model';

interface ShoppingCartState extends PersistentState {
  items: ShoppingCartItem[];
}

const initialState: ShoppingCartState = {
  persistent: true,
  items: [],
};

export const shoppingCartSlice = createSlice({
  name: 'shoppingCart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: ProductItem; quantity: number }>) => {
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
    }
  },
});

export const { addToCart, removeFromCart, clearCart } = shoppingCartSlice.actions;
export const selectItems = (state: RootState) => state.shoppingCart.items;

export default shoppingCartSlice.reducer;
