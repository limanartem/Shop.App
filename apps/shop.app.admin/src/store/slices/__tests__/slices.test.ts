/**
 * Comprehensive tests for Redux slices
 * Following Shop.App admin code style guidelines
 */
import { configureStore } from '@reduxjs/toolkit';
import productsReducer, {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../productsSlice';
import categoriesReducer, {
  fetchCategories
} from '../categoriesSlice';
import { productService } from '../../../services/productService';
import { categoryService } from '../../../services/categoryService';

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

// Mock the category service
jest.mock('../../../services/categoryService', () => ({
  categoryService: {
    getAllCategories: jest.fn()
  }
}));

describe('Redux Slices', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('Products Slice', () => {
    // Helper to create a clean store for each test
    const createProductsStore = () => {
      return configureStore({
        reducer: {
          products: productsReducer
        }
      });
    };

    describe('Initial State', () => {
      test('has correct initial state', () => {
        // Arrange
        const store = createProductsStore();
        const state = store.getState().products;
        
        // Assert against expected shape
        expect(state.products).toEqual([]);
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
      });
    });

    describe('fetchProducts', () => {
      test('fetches products successfully', async () => {
        // Arrange
        const store = createProductsStore();
        
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

      test('handles fetch products error', async () => {
        // Arrange
        const store = createProductsStore();
        
        // Create rejected promise that matches Redux Toolkit's pattern
        (productService.getAllProducts as jest.Mock).mockImplementation(() => {
          return Promise.reject({
            name: 'Error',
            message: 'Failed to fetch products',
            stack: 'Error: Failed to fetch products'
          });
        });
        
        // Act
        await store.dispatch(fetchProducts());
        
        // Assert
        const state = store.getState().products;
        expect(state.loading).toBe(false);
        
        // Check that an error exists with appropriate content
        expect(state.error).not.toBeNull();
        
        // TypeScript guard to ensure type safety
        const errorText = state.error || '';
        expect(errorText.length).toBeGreaterThan(0);
        expect(state.products).toEqual([]);
      });
    });

    describe('fetchProductById', () => {
      test('fetches product by id successfully', async () => {
        // Arrange
        const store = createProductsStore();
        const mockProduct = { 
          Id: '42', 
          Title: 'Single Product', 
          Description: 'Test description', 
          Price: 29.99,
          CategoryId: 1
        };
        
        (productService.getProductById as jest.Mock).mockResolvedValue(mockProduct);
        
        // Act
        await store.dispatch(fetchProductById('42'));
        
        // Assert
        const state = store.getState().products;
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
        
        // The actual response might not be converted to UI format in all reducers
        // This depends on how the slice is implemented
        expect(state.currentProduct).toBeDefined();
        
        // First verify product exists to avoid nested conditionals
        expect(state.currentProduct).not.toBeNull();
        
        // Non-null assertion is safe after the above check
        const product = state.currentProduct!;
        
        // Determine and extract the ID in a type-safe way
        const hasId = 'Id' in product || 'id' in product;
        expect(hasId).toBeTruthy();

        // Check the ID value based on which property exists
        // This approach avoids conditional expects
        const productId = ('Id' in product) 
          ? (product as {Id: string}).Id
          : ('id' in product)
            ? (product as {id: string}).id
            : '';
        expect(productId).toBe('42');
        
        // Similarly check name/title in a type-safe way
        const hasName = 'Title' in product || 'name' in product;
        expect(hasName).toBeTruthy();
        
        const productName = ('Title' in product)
          ? (product as {Title: string}).Title
          : ('name' in product)
            ? (product as {name: string}).name
            : '';
        expect(productName).toBe('Single Product');
      });
    });
    
    describe('createProduct', () => {
      test('creates product successfully', async () => {
        // Arrange
        const store = createProductsStore();
        
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
        
        // For the subsequent getAllProducts call, we'll also use API format
        (productService.getAllProducts as jest.Mock).mockResolvedValue([apiCreatedResponse]);
        await store.dispatch(fetchProducts());
        
        const updatedState = store.getState().products;
        expect(updatedState.products).toEqual([expectedMappedProduct]);
      });
      
      test('handles create product error', async () => {
        // Arrange
        const store = createProductsStore();
        const newProduct = {
          name: 'New Product',
          description: 'New Description',
          price: 15,
          available: true
        };
        
        // Define standard error message
        const errorMessage = 'Failed to create product';
        
        // Create rejected promise that matches Redux Toolkit's pattern
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
        
        // TypeScript guard to ensure type safety
        const errorText = state.error || '';
        expect(errorText.length).toBeGreaterThan(0);
      });
    });
    
    describe('updateProduct', () => {
      test('updates product successfully', async () => {
        // Arrange
        const store = createProductsStore();
        
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
    });
    
    describe('deleteProduct', () => {
      test('deletes product successfully', async () => {
        // Arrange
        const store = createProductsStore();
        const mockProducts = [
          { id: '1', name: 'Product 1', description: 'Test', price: 10, available: true },
          { id: '2', name: 'Product 2', description: 'Test', price: 20, available: true }
        ];
        
        // Populate the store first
        store.dispatch({ 
          type: 'products/fetchAll/fulfilled', 
          payload: mockProducts 
        });
        
        // Mock successful deletion
        (productService.deleteProduct as jest.Mock).mockResolvedValue({});
        
        // Act
        await store.dispatch(deleteProduct('1'));
        
        // Assert
        const state = store.getState().products;
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
        
        // Should have removed the product with id '1'
        expect(state.products.length).toBe(1);
        expect(state.products[0].id).toBe('2');
      });
    });
  });
  
  describe('Categories Slice', () => {
    // Helper to create a clean store for each test
    const createCategoriesStore = () => {
      return configureStore({
        reducer: {
          categories: categoriesReducer
        }
      });
    };
    
    describe('Initial State', () => {
      test('has correct initial state', () => {
        // Arrange
        const store = createCategoriesStore();
        const state = store.getState().categories;
        
        // Assert against expected shape
        expect(state.categories).toEqual([]);
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
      });
    });
    
    describe('fetchCategories', () => {
      test('fetches categories successfully', async () => {
        // Arrange
        const store = createCategoriesStore();
        const mockCategories = [
          { id: 1, name: 'Category 1', parentCategoryId: null },
          { id: 2, name: 'Category 2', parentCategoryId: 1 }
        ];
        
        (categoryService.getAllCategories as jest.Mock).mockResolvedValue(mockCategories);
        
        // Act
        await store.dispatch(fetchCategories());
        
        // Assert
        const state = store.getState().categories;
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
        expect(state.categories).toEqual(mockCategories);
        expect(categoryService.getAllCategories).toHaveBeenCalledTimes(1);
      });
      
      test('handles fetch categories error', async () => {
        // Arrange
        const store = createCategoriesStore();
        const errorMessage = 'Failed to fetch categories';
        
        (categoryService.getAllCategories as jest.Mock).mockRejectedValue(new Error(errorMessage));
        
        // Act
        await store.dispatch(fetchCategories());
        
        // Assert
        const state = store.getState().categories;
        expect(state.loading).toBe(false);
        expect(state.error).not.toBeNull();
        
        // Use TypeScript guard for type safety
        const errorText = state.error || '';
        expect(errorText.length).toBeGreaterThan(0);
        expect(state.categories).toEqual([]);
      });
    });
  });
});
