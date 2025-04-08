/**
 * Tests for the orders slice
 * Following Shop.App admin code style guidelines
 */
import { configureStore } from '@reduxjs/toolkit';
import ordersReducer, { fetchOrders, updateOrderStatus } from '../ordersSlice';
import { orderService } from '../../../services/orderService';

// Mock the order service
jest.mock('../../../services/orderService', () => ({
  orderService: {
    getAllOrders: jest.fn(),
    updateOrderStatus: jest.fn()
  }
}));

// Define types for the mock service
interface MockOrderService {
  getAllOrders: jest.Mock;
  updateOrderStatus: jest.Mock;
}

describe('Orders Slice', () => {
  // Setup before each test
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  // Helper function to create a test store with correct typing
  const createTestStore = () => {
    return configureStore({
      reducer: {
        orders: ordersReducer
      }
    });
  };
  
  describe('Initial State', () => {
    test('has correct default initial state', () => {
      // Arrange
      const store = createTestStore();
      
      // Act
      const state = store.getState().orders;
      
      // Assert
      expect(state.orders).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });
  });
  
  describe('Async Thunks', () => {
    describe('fetchOrders', () => {
      test('fetchOrders.pending sets loading state', async () => {
        // Arrange
        const store = createTestStore();
        
        // Mock pending state
        store.dispatch({
          type: fetchOrders.pending.type
        });
        
        // Assert
        const state = store.getState().orders;
        expect(state.loading).toBe(true);
        expect(state.error).toBe(null);
      });
      
      test('fetchOrders.fulfilled updates orders state', async () => {
        // Arrange
        const store = createTestStore();
        const mockOrders = [
          { 
            id: 'order1', 
            customerId: 'customer1', 
            orderDate: '2025-04-01T10:00:00Z',
            status: 'Processing',
            items: [
              { productId: 'product1', quantity: 2, price: 19.99 }
            ],
            totalAmount: 39.98
          },
          { 
            id: 'order2', 
            customerId: 'customer2', 
            orderDate: '2025-04-02T11:30:00Z',
            status: 'Shipped',
            items: [
              { productId: 'product2', quantity: 1, price: 29.99 }
            ],
            totalAmount: 29.99
          }
        ];
        
        // Act - Dispatch fulfilled action
        store.dispatch({
          type: fetchOrders.fulfilled.type,
          payload: mockOrders
        });
        
        // Assert
        const state = store.getState().orders;
        expect(state.loading).toBe(false);
        expect(state.orders).toEqual(mockOrders);
      });
      
      test('fetchOrders.rejected sets error state', async () => {
        // Arrange
        const store = createTestStore();
        const errorMessage = 'Failed to fetch orders';
        
        // Act - Dispatch rejected action
        store.dispatch({
          type: fetchOrders.rejected.type,
          error: { message: errorMessage }
        });
        
        // Assert
        const state = store.getState().orders;
        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
      });
      
      test('fetchOrders thunk dispatches fulfilled action on successful fetch', async () => {
        // Arrange
        const store = createTestStore();
        const mockOrders = [
          { id: 'order1', status: 'Processing' },
          { id: 'order2', status: 'Shipped' }
        ];
        
        // Type cast to access the mock function
        const mockOrderService = orderService as unknown as MockOrderService;
        mockOrderService.getAllOrders.mockResolvedValue(mockOrders);
        
        // Act
        await store.dispatch(fetchOrders());
        
        // Assert
        const state = store.getState().orders;
        expect(state.orders).toEqual(mockOrders);
        expect(mockOrderService.getAllOrders).toHaveBeenCalledTimes(1);
      });
      
      test('fetchOrders thunk dispatches rejected action on fetch failure', async () => {
        // Arrange
        const store = createTestStore();
        const errorMessage = 'Network error';
        
        // Type cast to access the mock function
        const mockOrderService = orderService as unknown as MockOrderService;
        mockOrderService.getAllOrders.mockRejectedValue(new Error(errorMessage));
        
        // Act
        await store.dispatch(fetchOrders());
        
        // Assert
        const state = store.getState().orders;
        expect(state.error).toBe(errorMessage);
        expect(mockOrderService.getAllOrders).toHaveBeenCalledTimes(1);
      });
    });
    
    describe('updateOrderStatus', () => {
      test('updateOrderStatus.fulfilled updates specific order in state', async () => {
        // Arrange
        const store = createTestStore();
        const initialOrders = [
          { id: 'order1', status: 'Processing' },
          { id: 'order2', status: 'Shipped' }
        ];
        
        // Set initial state with orders
        store.dispatch({
          type: fetchOrders.fulfilled.type,
          payload: initialOrders
        });
        
        const updatedOrder = { id: 'order1', status: 'Delivered' };
        
        // Act - Dispatch fulfilled action for updateOrderStatus
        store.dispatch({
          type: updateOrderStatus.fulfilled.type,
          payload: updatedOrder
        });
        
        // Assert
        const state = store.getState().orders;
        expect(state.orders).toEqual([
          { id: 'order1', status: 'Delivered' },
          { id: 'order2', status: 'Shipped' }
        ]);
      });
      
      test('updateOrderStatus.fulfilled does nothing if order not found', async () => {
        // Arrange
        const store = createTestStore();
        const initialOrders = [
          { id: 'order1', status: 'Processing' },
          { id: 'order2', status: 'Shipped' }
        ];
        
        // Set initial state with orders
        store.dispatch({
          type: fetchOrders.fulfilled.type,
          payload: initialOrders
        });
        
        const updatedOrder = { id: 'order3', status: 'Delivered' };
        
        // Act - Dispatch fulfilled action for updateOrderStatus
        store.dispatch({
          type: updateOrderStatus.fulfilled.type,
          payload: updatedOrder
        });
        
        // Assert
        const state = store.getState().orders;
        expect(state.orders).toEqual(initialOrders);
      });
      
      test('updateOrderStatus thunk dispatches fulfilled action on successful update', async () => {
        // Arrange
        const store = createTestStore();
        const initialOrders = [
          { id: 'order1', status: 'Processing' },
          { id: 'order2', status: 'Shipped' }
        ];
        
        // Set initial state with orders
        store.dispatch({
          type: fetchOrders.fulfilled.type,
          payload: initialOrders
        });
        
        const orderId = 'order1';
        const newStatus = 'Delivered';
        const updatedOrder = { id: orderId, status: newStatus };
        
        // Type cast to access the mock function
        const mockOrderService = orderService as unknown as MockOrderService;
        mockOrderService.updateOrderStatus.mockResolvedValue(updatedOrder);
        
        // Act
        await store.dispatch(updateOrderStatus({ orderId, status: newStatus }));
        
        // Assert
        const state = store.getState().orders;
        expect(state.orders[0]).toEqual(updatedOrder);
        expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith(orderId, newStatus);
      });
      
      test('updateOrderStatus thunk dispatches rejected action on update failure', async () => {
        // Arrange
        const store = createTestStore();
        const errorMessage = 'Failed to update order status';
        
        const orderId = 'order1';
        const newStatus = 'Delivered';
        
        // Type cast to access the mock function
        const mockOrderService = orderService as unknown as MockOrderService;
        mockOrderService.updateOrderStatus.mockRejectedValue(new Error(errorMessage));
        
        // Act & Assert
        await expect(
          store.dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap()
        ).rejects.toBeDefined();
        
        // Assert
        expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith(orderId, newStatus);
      });
    });
  });
});
