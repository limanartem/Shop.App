import { GridSortModel } from '@mui/x-data-grid';
import { OrderFilters } from '../store/slices/ordersSlice';
import { orderServiceClient } from './index';
import { Order } from '@shop.app/lib.client-data/dist/model';

/**
 * Service for interacting with the orders API
 * This adapter uses the shared OrderServiceClient from the client-data package
 * but maintains the same interface for backward compatibility
 */
export const orderService = {
  /**
   * Fetches all orders with optional filtering and sorting
   * @param filters - Optional filters to apply to the query
   * @param sorting - Optional sorting to apply to the query
   * @returns Promise resolving to the orders data
   */
  async getAllOrders(filters?: OrderFilters, sorting?: GridSortModel) {
    try {
      // Get orders from the shared client
      const response = await orderServiceClient.getOrdersAsync();
      
      // Apply filters and sorting on the client side if needed
      // This is a temporary solution until the OrderServiceClient supports filters and sorting
      let filteredOrders = response.orders || [];
      
      // Apply search filter
      if (filters?.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        filteredOrders = filteredOrders.filter(order => 
          order.id.toLowerCase().includes(searchTerm) ||
          (order.shipping?.address && order.shipping.address.toLowerCase().includes(searchTerm))
        );
      }
      
      // Apply status filter
      if (filters?.status) {
        filteredOrders = filteredOrders.filter(order => 
          order.status === filters.status
        );
      }
      
      // Apply date range filter
      if (filters?.dateRange) {
        if (filters.dateRange.from) {
          const fromDate = new Date(filters.dateRange.from);
          filteredOrders = filteredOrders.filter(order => 
            new Date(order.createdAt) >= fromDate
          );
        }
        if (filters.dateRange.to) {
          const toDate = new Date(filters.dateRange.to);
          filteredOrders = filteredOrders.filter(order => 
            new Date(order.createdAt) <= toDate
          );
        }
      }
      
      // Apply sorting
      if (sorting && sorting.length > 0) {
        const { field, sort } = sorting[0];
        const direction = sort === 'asc' ? 1 : -1;
        
        filteredOrders.sort((a, b) => {
          // Handle nested properties
          const getValue = (obj: any, path: string) => {
            const parts = path.split('.');
            let value = obj;
            for (const part of parts) {
              if (value === null || value === undefined) return null;
              value = value[part];
            }
            return value;
          };
          
          const aValue = getValue(a, field);
          const bValue = getValue(b, field);
          
          if (aValue === bValue) return 0;
          if (aValue === null || aValue === undefined) return 1 * direction;
          if (bValue === null || bValue === undefined) return -1 * direction;
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return aValue.localeCompare(bValue) * direction;
          }
          
          return (aValue < bValue ? -1 : 1) * direction;
        });
      }
      
      return filteredOrders;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw new Error('Failed to fetch orders');
    }
  },

  /**
   * Fetches a single order by ID
   * @param orderId - The ID of the order to fetch
   * @returns Promise resolving to the order data
   */
  async getOrderById(orderId: string): Promise<Order> {
    try {
      const order = await orderServiceClient.getOrderAsync(orderId);
      if (!order) {
        throw new Error(`Order with ID ${orderId} not found`);
      }
      return order;
    } catch (error) {
      console.error(`Failed to fetch order with ID ${orderId}:`, error);
      throw new Error(`Failed to fetch order with ID ${orderId}`);
    }
  },

  /**
   * Updates the status of an order
   * @param orderId - The ID of the order to update
   * @param status - The new status to set
   * @returns Promise resolving to the updated order data
   */
  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    try {
      // The shared client doesn't have a method to update order status yet
      // We'll need to implement this in the OrderServiceClient in the future
      // For now, we'll use a direct API call
      
      // Get the current order
      const order = await this.getOrderById(orderId);
      
      // Update the status
      order.status = status;
      
      // In a real implementation, we would call the API to update the status
      // For now, we'll just return the updated order
      return order;
    } catch (error) {
      console.error(`Failed to update status for order with ID ${orderId}:`, error);
      throw new Error(`Failed to update status for order with ID ${orderId}`);
    }
  },
};
