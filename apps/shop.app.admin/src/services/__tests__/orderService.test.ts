/**
 * Tests for the order service
 * Following Shop.App admin code style guidelines
 */
import { orderService } from '../orderService';
import { OrderFilters } from '../../store/slices/ordersSlice';
import { GridSortModel } from '@mui/x-data-grid';

// Store the original fetch function to restore after tests
const originalFetch = global.fetch;

describe('OrderService', () => {
  // Setup before each test
  beforeEach(() => {
    // Mock the global fetch function
    global.fetch = jest.fn();
    
    // Mock environment variables
    process.env.REACT_APP_ORDERS_API_URL = 'http://localhost:3001';
  });
  
  // Cleanup after each test
  afterEach(() => {
    // Restore the original fetch function
    global.fetch = originalFetch;
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  describe('getAllOrders', () => {
    test('returns orders when fetch is successful with no filters', async () => {
      // Arrange
      const mockOrdersResponse = {
        orders: [
          { 
            id: 'order1', 
            customerId: 'customer1', 
            createdAt: '2025-04-01T10:00:00Z',
            status: 'Processing',
            items: [
              { productId: 'product1', quantity: 2, price: 19.99 }
            ],
            totalAmount: 39.98
          },
          { 
            id: 'order2', 
            customerId: 'customer2', 
            createdAt: '2025-04-02T11:30:00Z',
            status: 'Shipped',
            items: [
              { productId: 'product2', quantity: 1, price: 29.99 }
            ],
            totalAmount: 29.99
          }
        ]
      };
      
      // Mock successful response
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve(mockOrdersResponse)
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Act
      const result = await orderService.getAllOrders();
      
      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/orders'
      );
      
      expect(result).toEqual(mockOrdersResponse.orders);
    });
    
    test('applies filters correctly when provided', async () => {
      // Arrange
      const filters: OrderFilters = {
        searchTerm: 'test order',
        status: 'pending',
        dateRange: {
          from: '2025-04-01',
          to: '2025-04-30'
        }
      };
      
      const mockOrdersResponse = {
        orders: [
          { 
            id: 'order1', 
            customerId: 'customer1', 
            createdAt: '2025-04-01T10:00:00Z',
            status: 'pending',
            items: [
              { productId: 'product1', quantity: 2, price: 19.99 }
            ],
            totalAmount: 39.98
          }
        ]
      };
      
      // Mock successful response
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve(mockOrdersResponse)
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Act
      const result = await orderService.getAllOrders(filters);
      
      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/orders?search=test%20order&status=pending&from=2025-04-01&to=2025-04-30'
      );
      
      expect(result).toEqual(mockOrdersResponse.orders);
    });
    
    test('applies sorting correctly when provided', async () => {
      // Arrange
      const sorting: GridSortModel = [
        { field: 'createdAt', sort: 'desc' }
      ];
      
      const mockOrdersResponse = {
        orders: [
          { 
            id: 'order2', 
            customerId: 'customer2', 
            createdAt: '2025-04-02T11:30:00Z',
            status: 'Shipped',
            items: [
              { productId: 'product2', quantity: 1, price: 29.99 }
            ],
            totalAmount: 29.99
          },
          { 
            id: 'order1', 
            customerId: 'customer1', 
            createdAt: '2025-04-01T10:00:00Z',
            status: 'Processing',
            items: [
              { productId: 'product1', quantity: 2, price: 19.99 }
            ],
            totalAmount: 39.98
          }
        ]
      };
      
      // Mock successful response
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve(mockOrdersResponse)
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Act
      const result = await orderService.getAllOrders(undefined, sorting);
      
      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/orders?sortField=createdAt&sortDirection=desc'
      );
      
      expect(result).toEqual(mockOrdersResponse.orders);
    });
    
    test('combines filters and sorting correctly', async () => {
      // Arrange
      const filters: OrderFilters = {
        status: 'pending'
      };
      
      const sorting: GridSortModel = [
        { field: 'totalAmount', sort: 'asc' }
      ];
      
      const mockOrdersResponse = {
        orders: [
          { 
            id: 'order1', 
            customerId: 'customer1', 
            createdAt: '2025-04-01T10:00:00Z',
            status: 'pending',
            items: [
              { productId: 'product1', quantity: 1, price: 19.99 }
            ],
            totalAmount: 19.99
          },
          { 
            id: 'order3', 
            customerId: 'customer3', 
            createdAt: '2025-04-03T14:20:00Z',
            status: 'pending',
            items: [
              { productId: 'product3', quantity: 2, price: 24.99 }
            ],
            totalAmount: 49.98
          }
        ]
      };
      
      // Mock successful response
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve(mockOrdersResponse)
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Act
      const result = await orderService.getAllOrders(filters, sorting);
      
      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/orders?status=pending&sortField=totalAmount&sortDirection=asc'
      );
      
      expect(result).toEqual(mockOrdersResponse.orders);
    });
    
    test('throws error when fetch fails', async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Act & Assert
      await expect(orderService.getAllOrders())
        .rejects
        .toThrow('Failed to fetch orders');
        
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    
    test('handles network error', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      // Act & Assert
      await expect(orderService.getAllOrders())
        .rejects
        .toThrow('Network error');
        
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('getOrderById', () => {
    test('retrieves a specific order by ID', async () => {
      // Arrange
      const orderId = 'order1';
      
      const mockOrder = { 
        id: orderId, 
        userId: 'user1',
        customerEmail: 'customer@example.com',
        createdAt: '2025-04-01T10:00:00Z',
        status: 'pending',
        items: [
          { 
            productId: 'product1', 
            quantity: 2, 
            price: 19.99,
            product: {
              id: 'product1',
              name: 'Test Product',
              price: 19.99
            }
          }
        ],
        totalAmount: 39.98,
        shipping: {
          address: '123 Test St',
          city: 'Test City',
          country: 'Test Country',
          zip: '12345'
        },
        payment: {
          method: 'Credit Card',
          status: 'paid'
        }
      };
      
      // Mock successful response
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve(mockOrder)
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Act
      const result = await orderService.getOrderById(orderId);
      
      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/orders/${orderId}`
      );
      
      expect(result).toEqual(mockOrder);
    });
    
    test('throws error when order is not found', async () => {
      // Arrange
      const orderId = 'nonexistent';
      
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Act & Assert
      await expect(orderService.getOrderById(orderId))
        .rejects
        .toThrow(`Failed to fetch order with ID ${orderId}`);
        
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('updateOrderStatus', () => {
    test('updates order status and fetches the updated order', async () => {
      // Arrange
      const orderId = 'order1';
      const status = 'delivered';
      
      // Mock successful status update response
      const mockUpdateResponse = {
        ok: true,
        json: () => Promise.resolve({ status })
      };
      
      // Mock successful get order response (after update)
      const mockOrderResponse = {
        ok: true,
        json: () => Promise.resolve({
          id: orderId, 
          userId: 'user1',
          customerEmail: 'customer@example.com',
          createdAt: '2025-04-01T10:00:00Z',
          status: status, // Updated status
          items: [
            { productId: 'product1', quantity: 2, price: 19.99 }
          ],
          totalAmount: 39.98
        })
      };
      
      // Setup fetch to return different responses for different calls
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('/status')) {
          return Promise.resolve(mockUpdateResponse);
        } else {
          return Promise.resolve(mockOrderResponse);
        }
      });
      
      // Act
      const result = await orderService.updateOrderStatus(orderId, status);
      
      // Assert
      // First call should be to update status
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        `http://localhost:3001/api/orders/${orderId}/status`,
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        })
      );
      
      // Second call should be to get the updated order
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        `http://localhost:3001/api/orders/${orderId}`
      );
      
      // Result should be the updated order
      expect(result).toEqual(expect.objectContaining({
        id: orderId,
        status: status
      }));
    });
    
    test('throws error when fetch fails', async () => {
      // Arrange
      const orderId = 'order1';
      const status = 'Delivered';
      
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Act & Assert
      await expect(orderService.updateOrderStatus(orderId, status))
        .rejects
        .toThrow('Failed to update order status');
        
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    
    test('handles network error', async () => {
      // Arrange
      const orderId = 'order1';
      const status = 'Delivered';
      
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      // Act & Assert
      await expect(orderService.updateOrderStatus(orderId, status))
        .rejects
        .toThrow('Network error');
        
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
