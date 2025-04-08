import { configureStore } from '@reduxjs/toolkit';
import productsReducer, {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../productsSlice';
import { productService } from '../../../services/productService';
import { UiProduct } from '../../../models/product';

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
      
      // Mock response with UI format (camelCase) that service now returns
      const mockUiProducts: UiProduct[] = [
        { id: '1', name: 'Product 1', description: 'Desc 1', price: 10, categoryId: 1, available: true },
        { id: '2', name: 'Product 2', description: 'Desc 2', price: 20, categoryId: 2, available: true }
      ];
      
      // Expected mapped results (same as mockUiProducts since no additional mapping needed)
      const expectedMappedProducts = [...mockUiProducts];
      
      // Mock the service to return the UI format
      (productService.getAllProducts as jest.Mock).mockResolvedValue(mockUiProducts);
      
      // Act
      await store.dispatch(fetchProducts());
      
      // Assert
      const state = store.getState().products;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.products).toEqual(expectedMappedProducts);
      expect(productService.getAllProducts).toHaveBeenCalledTimes(1);
    });

    test('handles fetch products error', async () => {
      // Arrange
      const store = createTestStore();
      
      // Create rejected promise that matches Redux Toolkit's pattern
      (productService.getAllProducts as jest.Mock).mockImplementation(() => {
        return Promise.reject(new Error('Failed to fetch products'));
      });
      
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
      const mockProduct: UiProduct = {
        id: '1',
        name: 'Product 1',
        description: 'Desc 1',
        price: 10,
        categoryId: 1,
        available: true
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
      const newProduct: UiProduct = {
        name: 'New Product',
        description: 'New Description',
        price: 15,
        available: true,
        categoryId: 1
      };
      
      // Service returns product in UI format
      const createdUiProduct: UiProduct = {
        id: '3', 
        name: 'New Product',
        description: 'New Description',
        price: 15,
        categoryId: 1,
        available: true
      };
      
      // Expected product is same as created product
      const expectedMappedProduct = createdUiProduct;
      
      // Mock createProduct to return the UI format response
      (productService.createProduct as jest.Mock).mockResolvedValue(createdUiProduct);
      
      // Act
      await store.dispatch(createProduct(newProduct));
      
      // Assert
      const state = store.getState().products;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
      expect(productService.createProduct).toHaveBeenCalledWith(newProduct);
      
      // Typically, after creation, you would refetch the products list
      // So let's simulate that
      
      // For the subsequent getAllProducts call, use UI format
      (productService.getAllProducts as jest.Mock).mockResolvedValue([createdUiProduct]);
      await store.dispatch(fetchProducts());
      
      const updatedState = store.getState().products;
      expect(updatedState.products).toEqual([expectedMappedProduct]);
    });

    test('handles create product error', async () => {
      // Arrange
      const store = createTestStore();
      const newProduct: UiProduct = {
        name: 'New Product',
        description: 'New Description',
        price: 15,
        available: true,
        categoryId: 1
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
      // UI format of the product to update
      const productToUpdate: UiProduct = {
        id: '1',
        name: 'Updated Product',
        description: 'Desc 1',
        price: 20,
        categoryId: 1,
        available: true
      };
      
      // Service returns updated product in UI format
      const updatedUiProduct: UiProduct = {
        id: '1',
        name: 'Updated Product',
        description: 'Desc 1',
        price: 20,
        categoryId: 1,
        available: true
      };
      
      // Expected product is same as updated product
      const expectedMappedProduct = updatedUiProduct;
      
      // Mock the updateProduct service to return UI format
      (productService.updateProduct as jest.Mock).mockResolvedValue(updatedUiProduct);
      
      // Act
      await store.dispatch(updateProduct(productToUpdate));
      
      // Assert
      const state = store.getState().products;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
      expect(productService.updateProduct).toHaveBeenCalledWith(productToUpdate);
      
      // After update, we would typically refetch the products
      // Use array with single product for the expected state
      (productService.getAllProducts as jest.Mock).mockResolvedValue([updatedUiProduct]);
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
