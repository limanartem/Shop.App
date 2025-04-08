/**
 * Tests for the Login component
 * Following Shop.App admin code style guidelines
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';

// Create a mock Redux store
const mockStore = {
  getState: jest.fn(),
  subscribe: jest.fn(),
  dispatch: jest.fn()
};

// Mock the useSelector and useDispatch hooks
const mockDispatch = jest.fn();
const mockSelector = jest.fn();

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => mockSelector(selector(mockStore.getState())),
  useDispatch: () => mockDispatch
}));

// Create a mock login action creator that returns a function (thunk)
const mockLoginAction = jest.fn().mockImplementation((credentials) => {
  return { type: 'auth/login', payload: credentials };
});

// Mock the authSlice module
jest.mock('../../store/slices/authSlice', () => ({
  ...jest.requireActual('../../store/slices/authSlice'),
  login: (credentials: { email: string; password: string }) => mockLoginAction(credentials)
}));

// Mock the react-router-dom hooks
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useLocation: () => ({
    state: { from: { pathname: '/dashboard' } }
  })
}));

describe('Login Component', () => {
  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock state
    mockStore.getState.mockReturnValue({
      auth: {
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        loading: false,
        error: null
      }
    });
    
    // Default selector implementation
    mockSelector.mockImplementation((state) => state);
  });
  
  test('renders login form correctly', () => {
    // Arrange & Act
    render(
      <Provider store={mockStore as any}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    
    // Assert
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
  
  test('allows entering email and password', async () => {
    // Arrange
    render(
      <Provider store={mockStore as any}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    
    const testEmail = 'admin@shop.app';
    const testPassword = 'password123';
    
    // Act
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await userEvent.type(emailInput, testEmail);
    await userEvent.type(passwordInput, testPassword);
    
    // Assert
    expect(emailInput).toHaveValue(testEmail);
    expect(passwordInput).toHaveValue(testPassword);
  });
  
  test('shows loading state during form submission', () => {
    // Arrange - Set loading state to true
    mockSelector.mockImplementation(() => ({
      loading: true,
      error: null
    }));
    
    // Act
    render(
      <Provider store={mockStore as any}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    
    // Assert
    expect(screen.getByRole('button', { name: '' })).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
  
  test('shows error message when login fails', () => {
    // Arrange - Set error state
    const errorMessage = 'Invalid email or password';
    mockSelector.mockImplementation(() => ({
      loading: false,
      error: errorMessage
    }));
    
    // Act
    render(
      <Provider store={mockStore as any}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    
    // Assert
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
  
  test('submits form with correct credentials', async () => {
    // Arrange
    render(
      <Provider store={mockStore as any}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    
    const testEmail = 'admin@shop.app';
    const testPassword = 'password123';
    
    // Mock successful login response
    mockDispatch.mockResolvedValue({
      meta: { requestStatus: 'fulfilled' }
    });
    
    // Act
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await userEvent.type(emailInput, testEmail);
    await userEvent.type(passwordInput, testPassword);
    fireEvent.click(submitButton);
    
    // Assert
    await waitFor(() => {
      expect(mockLoginAction).toHaveBeenCalledWith({ email: testEmail, password: testPassword });
    });
  });
  
  test('navigates on successful login', async () => {
    // Arrange
    render(
      <Provider store={mockStore as any}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    
    const testEmail = 'admin@shop.app';
    const testPassword = 'password123';
    
    // Mock successful login response
    mockDispatch.mockImplementation(() => Promise.resolve({
      type: 'auth/login/fulfilled',
      meta: { requestStatus: 'fulfilled' },
      payload: { user: { email: testEmail }, isAdmin: true }
    }));
    
    // Set the auth state to simulate a successful login
    mockSelector.mockImplementation(() => ({
      isAuthenticated: true,
      isAdmin: true,
      user: { email: testEmail },
      loading: false,
      error: null
    }));
    
    // Act
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await userEvent.type(emailInput, testEmail);
    await userEvent.type(passwordInput, testPassword);
    fireEvent.click(submitButton);
    
    // Assert
    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });
  
  test('dispatches login action on button click', async () => {
    // Arrange
    render(
      <Provider store={mockStore as any}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    
    const testEmail = 'admin@shop.app';
    const testPassword = 'password123';
    
    // Act
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await userEvent.type(emailInput, testEmail);
    await userEvent.type(passwordInput, testPassword);
    fireEvent.click(submitButton);
    
    // Assert
    await waitFor(() => {
      expect(mockLoginAction).toHaveBeenCalledWith({ email: testEmail, password: testPassword });
    });
  });
  
  test('handles login failure gracefully', async () => {
    // Arrange
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <Provider store={mockStore as any}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    
    const testEmail = 'admin@shop.app';
    const testPassword = 'wrong-password';
    
    // Mock failed login response with a properly structured action object
    // that includes the meta.requestStatus property needed by the Login component
    mockDispatch.mockImplementation(() => {
      return Promise.resolve({
        type: 'auth/login/rejected',
        error: { message: 'Login failed' },
        meta: { requestStatus: 'rejected' }
      });
    });
    
    // Set the auth state to simulate a login error
    mockSelector.mockImplementation(() => ({
      loading: false,
      error: 'Invalid credentials',
      isAuthenticated: false,
      isAdmin: false,
      user: null
    }));
    
    // Act
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await userEvent.type(emailInput, testEmail);
    await userEvent.type(passwordInput, testPassword);
    fireEvent.click(submitButton);
    
    // Assert - verify error handling
    await waitFor(() => {
      // Check that the error message is displayed
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
    
    // Clean up
    consoleErrorSpy.mockRestore();
  });
});
