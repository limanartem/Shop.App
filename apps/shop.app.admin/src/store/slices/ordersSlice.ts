import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderService } from '../../services/orderService';
import { GridFilterModel, GridSortModel } from '@mui/x-data-grid';
import { Order } from '@shop.app/lib.client-data/dist/model';

/**
 * Type definitions for order-related data
 */
export interface OrderItem {
  productId: string;
  quantity: number;
  status?: string;
  product?: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
  };
}

// Using Order type imported from shared library

/**
 * Filter options for orders
 */
export interface OrderFilters {
  searchTerm?: string;
  filterModel?: GridFilterModel;
  status?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

/**
 * State interface for the orders slice
 */
interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  filters: OrderFilters;
  sorting: GridSortModel;
  selectedOrder: Order | null;
}

/**
 * Initial state for the orders slice
 */
const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
  filters: {},
  sorting: [{ field: 'createdAt', sort: 'desc' }],
  selectedOrder: null,
};

/**
 * Async thunk to fetch orders with optional filtering and sorting
 */
export const fetchOrders = createAsyncThunk<Order[], void>(
  'orders/fetchAll', 
  async (_, { getState }) => {
    const { orders } = getState() as { orders: OrdersState };
    const { filters, sorting } = orders;
    const response = await orderService.getAllOrders(filters, sorting);
    return response;
  }
);

/**
 * Async thunk to fetch a single order by ID
 */
export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (orderId: string) => {
    const response = await orderService.getOrderById(orderId);
    return response;
  }
);

/**
 * Async thunk to update an order's status
 */
export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status }: { orderId: string; status: string }) => {
    const response = await orderService.updateOrderStatus(orderId, status);
    return response;
  }
);

/**
 * Orders slice with reducers and extra reducers for async actions
 */
export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    /**
     * Set filters for orders
     */
    setOrderFilters: (state, action: PayloadAction<OrderFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    /**
     * Clear all filters
     */
    clearOrderFilters: (state) => {
      state.filters = {};
    },
    
    /**
     * Set sorting for orders
     */
    setOrderSorting: (state, action: PayloadAction<GridSortModel>) => {
      state.sorting = action.payload;
    },
    
    /**
     * Set the selected order
     */
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders cases
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        // Explicitly cast the payload to ensure type compatibility
        state.orders = action.payload as unknown as typeof state.orders;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      
      // Fetch order by ID cases
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch order details';
      })
      
      // Update order status cases
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Update the order in the list
        const index = state.orders.findIndex(
          (o) => o.id === action.payload.id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        // Update selected order if it's the same one
        if (state.selectedOrder && state.selectedOrder.id === action.payload.id) {
          state.selectedOrder = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update order status';
      });
  },
});

// Export action creators
export const { 
  setOrderFilters, 
  clearOrderFilters, 
  setOrderSorting,
  setSelectedOrder 
} = ordersSlice.actions;

export default ordersSlice.reducer;
