import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CreateOrder, Order } from '@shop.app/lib.client-data/dist/model';
import { orderServiceClient } from '../../services';
import { RootState } from '../store';
import { DataLoadingState } from './categoriesReducer';

interface OrdersState {
  orders: Order[];
  ordersState: DataLoadingState;
}

const initialState: OrdersState = {
  orders: [],
  ordersState: DataLoadingState.idle,
};

export const fetchOrdersAsync = createAsyncThunk('orders/fetchOrders', async () => {
  return await orderServiceClient.getOrdersAsync();
});

export const createOrderAsync = createAsyncThunk('orders/createOrder', async (order: CreateOrder) => {
  return await orderServiceClient.createOrdersAsync(order);
});

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchOrdersAsync.fulfilled, (state, action) => {
      state.orders = action.payload.orders;
      state.ordersState = DataLoadingState.loaded;
    });
    builder.addCase(fetchOrdersAsync.pending, (state, action) => {
      state.orders = [];
      state.ordersState = DataLoadingState.loading;
    });
    builder.addCase(fetchOrdersAsync.rejected, (state, action) => {
      state.ordersState = DataLoadingState.failed;
    });
    /* builder.addCase(createOrderAsync.fulfilled, (state, action) => {
      fetchOrdersAsync();
    }); */
  },
});

export const { setOrders } = ordersSlice.actions;
export const selectOrders = (state: RootState) => state.orders.orders;
export const selectOrdersState = (state: RootState) => state.orders.ordersState;
export default ordersSlice.reducer;
