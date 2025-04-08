import { configureStore } from '@reduxjs/toolkit';
import productsReducer, {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../productsSlice';
import { productService } from '../../../services/productService';

// Mock the product service
jest.mock('../../../services/productService', () => ({
  productService: {
    getAllProducts: jest.fn(),
    getProductById: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
  }
}));

describe('Products Slice', () => {
  // Helper to create a clean store for each test
  const createTestStore = () => {
    return configureStore({
      reducer: {
        products: productsReducer
      }
    });
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    test('has correct initial state', () => {
      // Arrange
      const store = createTestStore();
      const state = store.getState().products;
      
      // Assert against expected shape instead of imported initialState
      expect(state.products).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.currentProduct).toBe(null);
    });
  });

  describe('fetchProducts', () => {
    test('fetches products successfully', async () => {
      // Arrange
      const store = createTestStore();
      // Mock API response with PascalCase fields to match .NET API format
      const mockApiProducts = [
        { Id: '1', Title: 'Product 1', Description: 'Desc 1', Price: 10, CategoryId: 1 },
        { Id: '2', Title: 'Product 2', Description: 'Desc 2', Price: 20, CategoryId: 2 }
      ];
      
      // Expected mapped result with camelCase fields as produced by the slice's mappers
      const expectedMappedProducts = [
        { id: '1', name: 'Product 1', description: 'Desc 1', price: 10, categoryId: 1, available: true },
        { id: '2', name: 'Product 2', description: 'Desc 2', price: 20, categoryId: 2, available: true }
      ];
      
      // Mock the service to return the API format
      (productService.getAllProducts as jest.Mock).mockResolvedValue(mockApiProducts);
      
      // Act
      await store.dispatch(fetchProducts());
      
      // Assert
      const state = store.getState().products;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.products).toEqual(expectedMappedProducts);
      expect(productService.getAllProducts).toHaveBeenCalledTimes(1);
    });

    test('handles fetch errors', async () => {
      // Arrange
      const store = createTestStore();
      const errorMessage = 'Failed to fetch products';
      
      (productService.getAllProducts as jest.Mock).mockRejectedValue(new Error(errorMessage));
      
      // Act
      await store.dispatch(fetchProducts());
      
      // Assert
      const state = store.getState().products;
      expect(state.loading).toBe(false);
      // Check that an error exists with appropriate content
      expect(state.error).not.toBeNull();
      // TypeScript guard to ensure type safety (satisfies .windsurfrules)
      const errorText = state.error || '';
      expect(errorText.length).toBeGreaterThan(0);
      expect(state.products).toEqual([]);
    });
  });

  describe('fetchProductById', () => {
    test('fetches a single product successfully', async () => {
      // Arrange
      const store = createTestStore();
      const mockProduct = {
        id: '1',
        name: 'Product 1',
        description: 'Desc 1',
        price: 10,
        available: true,
        categoryId: 1
      };
      
      (productService.getProductById as jest.Mock).mockResolvedValue(mockProduct);
      
      // Act
      await store.dispatch(fetchProductById('1'));
      
      // Assert
      const state = store.getState().products;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.currentProduct).toEqual(mockProduct);
      expect(productService.getProductById).toHaveBeenCalledWith('1');
    });

    test('handles product fetch error', async () => {
      // Arrange
      const store = createTestStore();
      const errorMessage = 'Product not found';
      
      (productService.getProductById as jest.Mock).mockRejectedValue(new Error(errorMessage));
      
      // Act
      await store.dispatch(fetchProductById('999'));
      
      // Assert
      const state = store.getState().products;
      expect(state.loading).toBe(false);
      // Check that an error exists with appropriate content
      expect(state.error).not.toBeNull();
      // TypeScript guard to ensure type safety (satisfies .windsurfrules)
      const errorText = state.error || '';
      expect(errorText.length).toBeGreaterThan(0);
      expect(state.currentProduct).toBe(null);
    });
  });

  describe('createProduct', () => {
    test('creates product successfully', async () => {
      // Arrange
      const store = createTestStore();
      // UI format for the new product to be created
      const newProduct = {
        name: 'New Product',
        description: 'New Description',
        price: 15,
        available: true,
        categoryId: 1
      };
      
      // API response format (.NET uses PascalCase)
      const apiCreatedResponse = {
        Id: '3',
        Title: 'New Product',
        Description: 'New Description',
        Price: 15,
        CategoryId: 1
      };
      
      // Expected mapped result after slice processing
      const expectedMappedProduct = {
        id: '3',
        name: 'New Product',
        description: 'New Description',
        price: 15,
        categoryId: 1,
        available: true
      };
      
      // Mock the API to return the .NET format response
      (productService.createProduct as jest.Mock).mockResolvedValue(apiCreatedResponse);
      
      // Act
      await store.dispatch(createProduct(newProduct));
      
      // Assert
      const state = store.getState().products;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
      expect(productService.createProduct).toHaveBeenCalledWith(newProduct);
      
      // Typically, after creation, you would refetch the products list
      // So let's simulate that
      
      // For the subsequent getAllProducts call, we'll also use API format
      (productService.getAllProducts as jest.Mock).mockResolvedValue([apiCreatedResponse]);
      await store.dispatch(fetchProducts());
      
      const updatedState = store.getState().products;
      expect(updatedState.products).toEqual([expectedMappedProduct]);
    });

    test('handles create product error', async () => {
      // Arrange
      const store = createTestStore();
      const newProduct = {
        name: 'New Product',
        description: 'New Description',
        price: 15,
        available: true
      };
      
      // Define standard error message
      const errorMessage = 'Failed to create product';
      
      // Create rejected promise that matches Redux Toolkit's pattern
      // with a SerializedError structure for proper propagation
      (productService.createProduct as jest.Mock).mockImplementation(() => {
        return Promise.reject({
          name: 'Error',
          message: errorMessage,
          stack: 'Error: ' + errorMessage
        });
      });
      
      // Act
      await store.dispatch(createProduct(newProduct));
      
      // Assert
      const state = store.getState().products;
      expect(state.loading).toBe(false);
      // Check that an error exists with appropriate content
      expect(state.error).not.toBeNull();
      // TypeScript guard to ensure type safety (satisfies .windsurfrules)
      const errorText = state.error || '';
      expect(errorText.length).toBeGreaterThan(0);
    });
  });

  describe('updateProduct', () => {
    test('updates product successfully', async () => {
      // Arrange
      const store = createTestStore();
      // UI format of existing product
      const existingProduct = {
        id: '1',
        name: 'Product 1',
        description: 'Desc 1',
        price: 10,
        available: true,
        categoryId: 1
      };
      
      // UI format of the updated product
      const updatedProduct = {
        ...existingProduct,
        name: 'Updated Product',
        price: 20
      };
      
      // API response format (.NET uses PascalCase)
      const apiUpdatedResponse = {
        Id: '1',
        Title: 'Updated Product',
        Description: 'Desc 1',
        Price: 20,
        CategoryId: 1
      };
      
      // Expected mapped product after slice processing
      const expectedMappedProduct = {
        id: '1',
        name: 'Updated Product',
        description: 'Desc 1',
        price: 20,
        categoryId: 1,
        available: true
      };
      
      // Mock the API to return the .NET format response
      (productService.updateProduct as jest.Mock).mockResolvedValue(apiUpdatedResponse);
      
      // Act
      await store.dispatch(updateProduct(updatedProduct));
      
      // Assert
      const state = store.getState().products;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
      expect(productService.updateProduct).toHaveBeenCalledWith(updatedProduct);
      
      // After update, we would typically refetch the products
      // Use the API format for the mock response
      (productService.getAllProducts as jest.Mock).mockResolvedValue([apiUpdatedResponse]);
      await store.dispatch(fetchProducts());
      
      const updatedState = store.getState().products;
      expect(updatedState.products).toEqual([expectedMappedProduct]);
    });

    test('handles update product error', async () => {
      // Arrange
      const store = createTestStore();
      const productToUpdate = {
        id: '1',
        name: 'Updated Product',
        description: 'Updated Description',
        price: 25.99,
        categoryId: 2,
        available: true // Required by Product interface
      };
      
      // Define standard error message
      const errorMessage = 'Failed to update product';
      
      // Create rejected promise that matches Redux Toolkit's pattern
      // This structure ensures error.message is available to the reducer
      (productService.updateProduct as jest.Mock).mockImplementation(() => {
        return Promise.reject({
          name: 'Error',
          message: errorMessage,
          stack: 'Error: ' + errorMessage
        });
      });
      
      // Act
      await store.dispatch(updateProduct(productToUpdate));
      
      // Assert
      const state = store.getState().products;
      expect(state.loading).toBe(false);
      // Check that an error exists with appropriate content
      expect(state.error).not.toBeNull();
      // TypeScript guard to ensure type safety (satisfies .windsurfrules)
      const errorText = state.error || '';
      expect(errorText.length).toBeGreaterThan(0);
    });
  });

  describe('deleteProduct', () => {
    test('deletes product successfully', async () => {
      // Arrange
      const store = createTestStore();
      
      // Set up initial state with products
      const products = [
        { id: '1', name: 'Product 1', description: 'Desc 1', price: 10, available: true },
        { id: '2', name: 'Product 2', description: 'Desc 2', price: 20, available: true }
      ];
      
      (productService.getAllProducts as jest.Mock).mockResolvedValue(products);
      await store.dispatch(fetchProducts());
      
      // Mock the delete operation
      (productService.deleteProduct as jest.Mock).mockResolvedValue(undefined);
      
      // After deletion, only Product 2 remains
      (productService.getAllProducts as jest.Mock).mockResolvedValue([products[1]]);
      
      // Act
      await store.dispatch(deleteProduct('1'));
      
      // Assert
      expect(productService.deleteProduct).toHaveBeenCalledWith('1');
      
      // Refetch to verify the product was deleted
      await store.dispatch(fetchProducts());
      
      const state = store.getState().products;
      expect(state.products.length).toBe(1);
      expect(state.products[0].id).toBe('2');
    });

    test('handles delete product error', async () => {
      // Arrange
      const store = createTestStore();
      
      // Define standard error message
      const errorMessage = 'Failed to delete product';
      
      // Create rejected promise that matches Redux Toolkit's pattern
      // This structure ensures the error.message is available to the reducer
      (productService.deleteProduct as jest.Mock).mockImplementation(() => {
        return Promise.reject({
          name: 'Error',
          message: errorMessage,
          stack: 'Error: ' + errorMessage
        });
      });
      
      // Act
      await store.dispatch(deleteProduct('1'));
      
      // Assert
      const state = store.getState().products;
      expect(state.loading).toBe(false);
      // Check that an error exists with appropriate content
      expect(state.error).not.toBeNull();
      // TypeScript guard to ensure type safety (satisfies .windsurfrules)
      const errorText = state.error || '';
      expect(errorText.length).toBeGreaterThan(0);
    });
  });
});
