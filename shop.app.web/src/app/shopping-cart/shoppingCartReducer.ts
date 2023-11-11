import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductItem, ShoppingCartItem } from '../../model';
import { RootState } from '../store';

interface ShoppingCartState {
  items: ShoppingCartItem[];
}

const initialState: ShoppingCartState = {
  items: [],
};

export const shoppingCartSlice = createSlice({
  name: 'shoppingCart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: ProductItem; quantity: number }>) => {
      const { product, quantity } = action.payload;
      state.items.push({ productId: product.id, quantity });
    },
    removeFromCart: (state, action: PayloadAction<ProductItem>) => {
      state.items = state.items.filter((item) => item.productId !== action.payload.id);
    },
  },
});

export const { addToCart, removeFromCart } = shoppingCartSlice.actions;
export const selectShoppingCart = (state: RootState) => state.shoppingCart.items;

export default shoppingCartSlice.reducer;
