/**
 * Tests for the orders slice
 * Following Shop.App admin code style guidelines
 */
import { configureStore } from '@reduxjs/toolkit';
import ordersReducer, {
  fetchOrders,
  updateOrderStatus,
  fetchOrderById,
  setOrderFilters,
  clearOrderFilters,
  setOrderSorting,
  setSelectedOrder,
  OrderFilters
} from '../ordersSlice';
import { orderService } from '../../../services/orderService';
import { GridSortModel } from '@mui/x-data-grid';

// Mock the order service
jest.mock('../../../services/orderService', () => ({
  orderService: {
    getAllOrders: jest.fn(),
    updateOrderStatus: jest.fn(),
    getOrderById: jest.fn()
  }
}));

// Define types for the mock service
interface MockOrderService {
  getAllOrders: jest.Mock;
  updateOrderStatus: jest.Mock;
  getOrderById: jest.Mock;
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
      expect(state.filters).toEqual({});
      expect(state.sorting).toEqual([{ field: 'createdAt', sort: 'desc' }]);
      expect(state.selectedOrder).toBe(null);
    });
  });
  
  describe('Reducers', () => {
    test('setOrderFilters updates filters state', () => {
      // Arrange
      const store = createTestStore();
      const filters: OrderFilters = {
        searchTerm: 'test',
        status: 'pending',
        dateRange: {
          from: '2025-04-01',
          to: '2025-04-30'
        }
      };
      
      // Act
      store.dispatch(setOrderFilters(filters));
      
      // Assert
      const state = store.getState().orders;
      expect(state.filters).toEqual(filters);
    });
    
    test('setOrderFilters merges with existing filters', () => {
      // Arrange
      const store = createTestStore();
      
      // Set initial filters
      store.dispatch(setOrderFilters({ searchTerm: 'initial' }));
      
      // Add more filters
      store.dispatch(setOrderFilters({ status: 'pending' }));
      
      // Assert
      const state = store.getState().orders;
      expect(state.filters).toEqual({
        searchTerm: 'initial',
        status: 'pending'
      });
    });
    
    test('clearOrderFilters resets filters to empty object', () => {
      // Arrange
      const store = createTestStore();
      
      // Set some filters
      store.dispatch(setOrderFilters({
        searchTerm: 'test',
        status: 'pending'
      }));
      
      // Act
      store.dispatch(clearOrderFilters());
      
      // Assert
      const state = store.getState().orders;
      expect(state.filters).toEqual({});
    });
    
    test('setOrderSorting updates sorting state', () => {
      // Arrange
      const store = createTestStore();
      const sorting: GridSortModel = [
        { field: 'totalAmount', sort: 'asc' }
      ];
      
      // Act
      store.dispatch(setOrderSorting(sorting));
      
      // Assert
      const state = store.getState().orders;
      expect(state.sorting).toEqual(sorting);
    });
    
    test('setSelectedOrder updates selectedOrder state', () => {
      // Arrange
      const store = createTestStore();
      const order = {
        id: 'order1',
        userId: 'user1',
        customerEmail: 'customer@example.com',
        status: 'pending',
        totalAmount: 39.98,
        items: [],
        createdAt: '2025-04-01T10:00:00Z',
        updatedAt: '2025-04-01T10:00:00Z'
      };
      
      // Act
      store.dispatch(setSelectedOrder(order));
      
      // Assert
      const state = store.getState().orders;
      expect(state.selectedOrder).toEqual(order);
    });
    
    test('setSelectedOrder can clear selected order', () => {
      // Arrange
      const store = createTestStore();
      const order = {
        id: 'order1',
        userId: 'user1',
        customerEmail: 'customer@example.com',
        status: 'pending',
        totalAmount: 39.98,
        items: [],
        createdAt: '2025-04-01T10:00:00Z',
        updatedAt: '2025-04-01T10:00:00Z'
      };
      
      // Set an order first
      store.dispatch(setSelectedOrder(order));
      
      // Act - Clear the selection
      store.dispatch(setSelectedOrder(null));
      
      // Assert
      const state = store.getState().orders;
      expect(state.selectedOrder).toBe(null);
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
    
    describe('fetchOrderById', () => {
      test('fetchOrderById.pending sets loading state', async () => {
        // Arrange
        const store = createTestStore();
        
        // Mock pending state
        store.dispatch({
          type: fetchOrderById.pending.type
        });
        
        // Assert
        const state = store.getState().orders;
        expect(state.loading).toBe(true);
        expect(state.error).toBe(null);
      });
      
      test('fetchOrderById.fulfilled updates selectedOrder state', async () => {
        // Arrange
        const store = createTestStore();
        const mockOrder = {
          id: 'order1',
          userId: 'user1',
          customerEmail: 'customer@example.com',
          status: 'pending',
          totalAmount: 39.98,
          items: [],
          createdAt: '2025-04-01T10:00:00Z',
          updatedAt: '2025-04-01T10:00:00Z'
        };
        
        // Act - Dispatch fulfilled action
        store.dispatch({
          type: fetchOrderById.fulfilled.type,
          payload: mockOrder
        });
        
        // Assert
        const state = store.getState().orders;
        expect(state.loading).toBe(false);
        expect(state.selectedOrder).toEqual(mockOrder);
      });
      
      test('fetchOrderById.rejected sets error state', async () => {
        // Arrange
        const store = createTestStore();
        const errorMessage = 'Failed to fetch order details';
        
        // Act - Dispatch rejected action
        store.dispatch({
          type: fetchOrderById.rejected.type,
          error: { message: errorMessage }
        });
        
        // Assert
        const state = store.getState().orders;
        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
      });
      
      test('fetchOrderById thunk dispatches fulfilled action on successful fetch', async () => {
        // Arrange
        const store = createTestStore();
        const orderId = 'order1';
        const mockOrder = {
          id: orderId,
          userId: 'user1',
          customerEmail: 'customer@example.com',
          status: 'pending',
          totalAmount: 39.98,
          items: [],
          createdAt: '2025-04-01T10:00:00Z',
          updatedAt: '2025-04-01T10:00:00Z'
        };
        
        // Type cast to access the mock function
        const mockOrderService = orderService as unknown as MockOrderService;
        mockOrderService.getOrderById.mockResolvedValue(mockOrder);
        
        // Act
        await store.dispatch(fetchOrderById(orderId));
        
        // Assert
        const state = store.getState().orders;
        expect(state.selectedOrder).toEqual(mockOrder);
        expect(mockOrderService.getOrderById).toHaveBeenCalledTimes(1);
        expect(mockOrderService.getOrderById).toHaveBeenCalledWith(orderId);
      });
    });
    
    describe('updateOrderStatus', () => {
      test('updateOrderStatus.pending sets loading state', async () => {
        // Arrange
        const store = createTestStore();
        
        // Mock pending state
        store.dispatch({
          type: updateOrderStatus.pending.type
        });
        
        // Assert
        const state = store.getState().orders;
        expect(state.loading).toBe(true);
        expect(state.error).toBe(null);
      });
      
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
          { id: 'order1', status: 'Processing' }
        ];
        const orderId = 'order1';
        
        // Set initial selected order
        store.dispatch(setSelectedOrder({
          id: orderId,
          userId: 'user1',
          customerEmail: 'customer@example.com',
          status: 'Processing',
          totalAmount: 39.98,
          items: [],
          createdAt: '2025-04-01T10:00:00Z',
          updatedAt: '2025-04-01T10:00:00Z'
        }));
        
        const updatedOrder = {
          id: orderId,
          userId: 'user1',
          customerEmail: 'customer@example.com',
          status: 'Delivered',
          totalAmount: 39.98,
          items: [],
          createdAt: '2025-04-01T10:00:00Z',
          updatedAt: '2025-04-02T10:00:00Z'
        };
        
        // Act - Dispatch fulfilled action for updateOrderStatus
        store.dispatch({
          type: updateOrderStatus.fulfilled.type,
          payload: updatedOrder
        });
        
        // Assert
        const state = store.getState().orders;
        expect(state.selectedOrder).toEqual(updatedOrder);
      });
      
      test('updateOrderStatus.rejected sets error state', async () => {
        // Arrange
        const store = createTestStore();
        const errorMessage = 'Failed to update order status';
        
        // Act - Dispatch rejected action
        store.dispatch({
          type: updateOrderStatus.rejected.type,
          error: { message: errorMessage }
        });
        
        // Assert
        const state = store.getState().orders;
        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
      });
      
      test('updateOrderStatus thunk calls service and dispatches actions', async () => {
        // Arrange
        const store = createTestStore();
        const orderId = 'order1';
        const status = 'Delivered';
        const mockUpdatedOrder = { id: orderId, status };
        
        // Type cast to access the mock function
        const mockOrderService = orderService as unknown as MockOrderService;
        mockOrderService.updateOrderStatus.mockResolvedValue(mockUpdatedOrder);
        
        // Act
        await store.dispatch(updateOrderStatus({ orderId, status }));
        
        // Assert
        expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith(orderId, status);
        
        const state = store.getState().orders;
        expect(state.error).toBe(null);
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
