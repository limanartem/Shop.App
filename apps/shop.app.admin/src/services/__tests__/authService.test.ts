/**
 * Tests for the authentication service
 * Following Shop.App admin code style guidelines
 */
import { authService } from '../authService';

// Store the original fetch function to restore after tests
const originalFetch = global.fetch;

describe('AuthService', () => {
  // Setup before each test
  beforeEach(() => {
    // Mock the global fetch function
    global.fetch = jest.fn();
    
    // Mock environment variables
    process.env.REACT_APP_AUTH_API_URL = 'http://localhost:3003';
  });
  
  // Cleanup after each test
  afterEach(() => {
    // Restore the original fetch function
    global.fetch = originalFetch;
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  describe('login', () => {
    test('successful login with admin credentials', async () => {
      // Arrange
      const email = 'admin@shop.app';
      const password = 'password123';
      
      // Mock successful response
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          status: 'OK',
          user: {
            emails: ['admin@shop.app']
          }
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Act
      const result = await authService.login(email, password);
      
      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3003/auth/signin',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            formFields: [
              { id: 'email', value: email },
              { id: 'password', value: password }
            ]
          })
        })
      );
      
      expect(result).toEqual({
        status: 'OK',
        user: {
          emails: ['admin@shop.app']
        },
        isAdmin: true
      });
    });
    
    test('login with wrong credentials', async () => {
      // Arrange
      const email = 'user@example.com';
      const password = 'wrongpassword';
      
      // Mock error response
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          status: 'WRONG_CREDENTIALS_ERROR'
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Act & Assert
      await expect(authService.login(email, password))
        .rejects
        .toThrow('Invalid email or password');
        
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    
    test('login with non-admin credentials', async () => {
      // Arrange
      const email = 'regular@shop.app';
      const password = 'password123';
      
      // Mock successful response but for non-admin user
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          status: 'OK',
          user: {
            emails: ['regular@shop.app']
          }
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Act & Assert
      await expect(authService.login(email, password))
        .rejects
        .toThrow('Access denied. Admin privileges required.');
        
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    
    test('login with unexpected error status', async () => {
      // Arrange
      const email = 'admin@shop.app';
      const password = 'password123';
      
      // Mock response with unexpected status
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          status: 'UNKNOWN_ERROR'
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Act & Assert
      await expect(authService.login(email, password))
        .rejects
        .toThrow('UNKNOWN_ERROR');
        
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    
    test('login with network error', async () => {
      // Arrange
      const email = 'admin@shop.app';
      const password = 'password123';
      
      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      // Act & Assert
      await expect(authService.login(email, password))
        .rejects
        .toThrow('Network error');
        
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    
    test('login with malformed user data', async () => {
      // Arrange
      const email = 'admin@shop.app';
      const password = 'password123';
      
      // Mock response with malformed user data
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          status: 'OK',
          user: {} // Missing emails array
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Act & Assert
      await expect(authService.login(email, password))
        .rejects
        .toThrow('Access denied. Admin privileges required.');
        
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('logout', () => {
    test('successful logout', async () => {
      // Arrange
      const mockResponse = {
        ok: true
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Act
      await authService.logout();
      
      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3003/auth/signout',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
    
    test('failed logout', async () => {
      // Arrange
      const mockResponse = {
        ok: false
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Act & Assert
      await expect(authService.logout())
        .rejects
        .toThrow('Logout failed');
        
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    
    test('logout with network error', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      // Act & Assert
      await expect(authService.logout())
        .rejects
        .toThrow('Network error');
        
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
