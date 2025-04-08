/**
 * Tests for the order service
 * Following Shop.App admin code style guidelines
 */
import { orderService } from '../orderService';

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
    test('returns orders when fetch is successful', async () => {
      // Arrange
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
      
      // Mock successful response
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve(mockOrders)
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Act
      const result = await orderService.getAllOrders();
      
      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/orders'
      );
      
      expect(result).toEqual(mockOrders);
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
  
  describe('updateOrderStatus', () => {
    test('updates order status when fetch is successful', async () => {
      // Arrange
      const orderId = 'order1';
      const status = 'Delivered';
      
      const mockUpdatedOrder = { 
        id: orderId, 
        customerId: 'customer1', 
        orderDate: '2025-04-01T10:00:00Z',
        status: status,
        items: [
          { productId: 'product1', quantity: 2, price: 19.99 }
        ],
        totalAmount: 39.98
      };
      
      // Mock successful response
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve(mockUpdatedOrder)
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Act
      const result = await orderService.updateOrderStatus(orderId, status);
      
      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/orders/${orderId}/status`,
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        })
      );
      
      expect(result).toEqual(mockUpdatedOrder);
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
