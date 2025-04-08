// jest-dom adds custom jest matchers for asserting on DOM nodes
import '@testing-library/jest-dom';

/**
 * Define test environment variables
 */
process.env.REACT_APP_CATALOG_API_URL = 'http://localhost:5002';
process.env.REACT_APP_CDN_URL = 'http://localhost:3005/public';

/**
 * Type definitions for the global mocks are declared directly on implementation
 * to follow the Wind Surf Rules of avoiding unused types
 */

/**
 * Mock localStorage for testing
 * This ensures all tests get consistent auth token values
 */
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn((key) => {
      // Always return test-token for auth token requests
      if (key === 'authToken') return 'test-token';
      return null;
    }),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Also mock sessionStorage with same implementation for complete coverage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn((key) => {
      if (key === 'authToken') return 'test-token';
      return null;
    }),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

/**
 * Mock global fetch API
 */
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    status: 200
  }) as unknown as Promise<Response>
);

/**
 * Mock CDN image upload function
 */
(global as any).uploadImageToCdn = jest.fn().mockImplementation(
  (imageDataUrl: string, productId: string, index: number) => 
    Promise.resolve(`/shop-assets/products/thumbnails/${productId}-${index}.png`)
);

/**
 * Mock product image processing function
 */
(global as any).processProductImages = jest.fn().mockImplementation(
  (product: { imageUrls?: string[] }) => 
    Promise.resolve(product.imageUrls || [])
);
