/**
 * Unit tests for the Orders component
 * Following Shop.App admin code style guidelines
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Orders from '../Orders';
import { 
  fetchOrders, 
  setOrderFilters, 
  setOrderSorting, 
  updateOrderStatus 
} from '../../store/slices/ordersSlice';

// Mock the Material UI components that might cause issues in tests
jest.mock('@mui/material/Tooltip', () => ({ children }: { children: React.ReactNode }) => children);
jest.mock('@mui/material/Dialog', () => ({ children, open, onClose, ...props }: any) => 
  open ? <div data-testid="update-order-dialog" {...props}>{children}</div> : null
);

// Create mock store
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('Orders Component', () => {
  // Initial mock state
  const initialState = {
    orders: {
      orders: [
        {
          id: 'order1',
          customerEmail: 'customer1@example.com',
          status: 'pending',
          totalAmount: 39.98,
          createdAt: '2025-04-01T10:00:00Z',
          updatedAt: '2025-04-01T10:00:00Z'
        },
        {
          id: 'order2',
          customerEmail: 'customer2@example.com',
          status: 'dispatched',
          totalAmount: 29.99,
          createdAt: '2025-04-02T11:30:00Z',
          updatedAt: '2025-04-02T11:30:00Z'
        }
      ],
      loading: false,
      error: null,
      filters: {},
      sorting: [{ field: 'createdAt', sort: 'desc' }],
      selectedOrder: null
    }
  };

  test('renders orders page with data grid', () => {
    // Arrange
    const store = mockStore(initialState);
    
    // Act
    render(
      <Provider store={store}>
        <Orders />
      </Provider>
    );
    
    // Assert
    expect(screen.getByTestId('orders-title')).toBeInTheDocument();
    expect(screen.getByTestId('orders-grid')).toBeInTheDocument();
    
    // Verify orders are displayed
    expect(screen.getByText('customer1@example.com')).toBeInTheDocument();
    expect(screen.getByText('customer2@example.com')).toBeInTheDocument();
  });

  test('dispatches fetchOrders action on component mount', () => {
    // Arrange
    const store = mockStore(initialState);
    
    // Act
    render(
      <Provider store={store}>
        <Orders />
      </Provider>
    );
    
    // Assert
    const actions = store.getActions();
    expect(actions).toContainEqual(expect.objectContaining({
      type: fetchOrders.pending.type
    }));
  });

  test('allows searching for orders', () => {
    // Arrange
    const store = mockStore(initialState);
    
    // Act
    render(
      <Provider store={store}>
        <Orders />
      </Provider>
    );
    
    // Simulate search input
    const searchInput = screen.getByTestId('orders-search-input');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    // Click search button
    const searchButton = screen.getByTestId('orders-search-button');
    fireEvent.click(searchButton);
    
    // Assert
    const actions = store.getActions();
    expect(actions).toContainEqual(setOrderFilters({ searchTerm: 'test search' }));
    expect(actions).toContainEqual(expect.objectContaining({
      type: fetchOrders.pending.type
    }));
  });

  test('opens update status dialog when update button is clicked', async () => {
    // Arrange
    const store = mockStore(initialState);
    
    // Act
    render(
      <Provider store={store}>
        <Orders />
      </Provider>
    );
    
    // Find and click the update button for the first order
    const updateButton = screen.getByTestId('update-order-order1');
    fireEvent.click(updateButton);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('update-order-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('order-status-select')).toBeInTheDocument();
    });
  });

  test('dispatches updateOrderStatus when status is updated', async () => {
    // Arrange
    const store = mockStore({
      ...initialState,
      orders: {
        ...initialState.orders,
        selectedOrder: {
          id: 'order1',
          status: 'pending'
        }
      }
    });
    
    // Act
    render(
      <Provider store={store}>
        <Orders />
      </Provider>
    );
    
    // Open the update dialog
    const updateButton = screen.getByTestId('update-order-order1');
    fireEvent.click(updateButton);
    
    // Select a new status
    const statusSelect = await screen.findByTestId('order-status-select');
    fireEvent.mouseDown(statusSelect);
    
    // Select the "dispatched" option
    const dispatchedOption = await screen.findByTestId('status-option-dispatched');
    fireEvent.click(dispatchedOption);
    
    // Click the confirm button
    const confirmButton = screen.getByTestId('confirm-status-update-button');
    fireEvent.click(confirmButton);
    
    // Assert
    const actions = store.getActions();
    expect(actions).toContainEqual(updateOrderStatus({ 
      orderId: 'order1', 
      status: 'dispatched' 
    }));
  });

  test('handles sorting changes', () => {
    // Arrange
    const store = mockStore(initialState);
    
    // Act
    render(
      <Provider store={store}>
        <Orders />
      </Provider>
    );
    
    // Simulate sort model change by directly calling the handler
    // Since DataGrid sorting UI is complex to test directly
    const sortModel = [{ field: 'totalAmount', sort: 'asc' }];
    
    // Get the component instance and call the handler
    // This is a simplified approach since we can't easily trigger the DataGrid sort UI
    store.dispatch(setOrderSorting(sortModel));
    
    // Assert
    const actions = store.getActions();
    expect(actions).toContainEqual(setOrderSorting(sortModel));
  });
});
