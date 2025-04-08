/**
 * Comprehensive tests for ProductService
 * Following Shop.App admin code style guidelines
 */
import { productService } from '../productService';

// Import the standardized interfaces from our models
import { ApiProduct, UiProduct } from '../../models/product';

describe('ProductService', () => {
  beforeEach(() => {
    // Reset fetch mock between tests
    (global.fetch as jest.Mock).mockReset();
    
    // Ensure auth token is consistently mocked
    jest.spyOn(window.localStorage, 'getItem').mockImplementation((key) => {
      if (key === 'authToken') return 'test-token';
      return null;
    });
    
    jest.spyOn(window.sessionStorage, 'getItem').mockImplementation((key) => {
      if (key === 'authToken') return 'test-token';
      return null;
    });
  });
  
  describe('Basic API Interactions', () => {
    test('getAllProducts fetches products from the API', async () => {
      // Arrange - Mock API response in camelCase format per actual API
      const mockProducts: ApiProduct[] = [
        { 
          id: '1', 
          title: 'Test Product', 
          description: 'Test description', 
          price: 19.99, 
          categoryId: 1,
          previewImageUrls: JSON.stringify(['/test.jpg'])
        }
      ];
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts),
        status: 200
      } as Response);
      
      // Act
      const products = await productService.getAllProducts();
      
      // Assert
      expect(products).toBeDefined();
      expect(products.length).toBe(1);
      
      // Direct property access with standardized interface
      expect(products[0].id).toBe('1');
      expect(products[0].name).toBe('Test Product');
      expect(products[0].description).toBe('Test description');
      expect(products[0].price).toBe(19.99);
      expect(products[0].imageUrls).toEqual(['/test.jpg']);
      expect(products[0].available).toBe(true); // Added available property
      
      // Check API call details
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/products'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });
    
    test('getProductById returns a single product', async () => {
      // Arrange - use camelCase that matches the API format
      const mockProduct: ApiProduct = { 
        id: '42', 
        title: 'Single Product',  // camelCase as per API format
        description: 'Single product description', 
        price: 42.99, 
        categoryId: 2 
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProduct),
        status: 200
      } as Response);
      
      // Act
      const product = await productService.getProductById('42');
      
      // Assert with direct property access since type is now consistent
      expect(product).toBeDefined();
      expect(product.id).toBe('42');
      expect(product.name).toBe('Single Product');
      expect(product.description).toBe('Single product description');
      expect(product.price).toBe(42.99);
      expect(product.categoryId).toBe(2);
      expect(product.available).toBe(true); // Added available property
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/products/42'),
        expect.any(Object)
      );
    });
    
    test('getProductById throws error when product not found', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      } as Response);
      
      // Act & Assert
      await expect(productService.getProductById('999')).rejects.toThrow();
    });
  });
  
  describe('Product Management Operations', () => {
    test('createProduct sends data to API correctly', async () => {
      // Test product with all required fields
      const newProduct: UiProduct = {
        name: 'Test Product',
        description: 'Test description',
        price: 29.99,
        categoryId: 2,
        imageUrls: ['/test1.jpg', '/test2.jpg'],
        available: true
      };
      
      // We'll create and use the UI format directly
      // This is consistent with how the service layer returns data
      
      // Capture the sent request data
      let requestBody: string | undefined;
      
      (global.fetch as jest.Mock).mockImplementationOnce((url, options) => {
        requestBody = options.body as string;
        
        // Convert to proper UI format for service layer to transform
        const responseProduct: UiProduct = {
          id: '123',
          name: 'Test Product',
          description: 'Test description',
          price: 29.99,
          categoryId: 2,
          imageUrls: ['/test1.jpg', '/test2.jpg'],
          available: true
        };
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(responseProduct),
          status: 201
        } as Response);
      });
      
      // Act
      const result = await productService.createProduct(newProduct);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('123');
      expect(result.name).toBe('Test Product');
      
      // Verify request format
      expect(requestBody).toBeDefined();
      const sentData = requestBody ? JSON.parse(requestBody) : {};
      expect(sentData.title).toBe('Test Product');
      expect(sentData.description).toBe('Test description');
      expect(sentData.price).toBe(29.99);
      // Note: available property is not sent to the API as per mapUiToApiProduct function
    });
    
    test('updateProduct updates existing product', async () => {
      // Arrange
      // Product with ID for update
      const productToUpdate: UiProduct = {
        id: '42',
        name: 'Updated Product',
        description: 'Updated description',
        price: 39.99,
        categoryId: 3,
        imageUrls: ['/updated.jpg'],
        available: true
      };
      
      // API response format in camelCase
      const apiUpdatedResponse: ApiProduct = {
        id: '42',
        title: 'Updated Product',
        description: 'Updated Description',
        price: 39.99,
        categoryId: 2
      };
      
      // Capture request body for verification
      let sentBodyData: string | undefined;
      
      (global.fetch as jest.Mock).mockImplementationOnce((url, options) => {
        sentBodyData = options.body as string;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(apiUpdatedResponse),
          status: 200
        } as Response);
      });
      
      // Act
      await productService.updateProduct(productToUpdate);
      
      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/products/42'),
        expect.objectContaining({ method: 'PUT' })
      );
      
      // Verify request data
      expect(sentBodyData).toBeDefined();
      const sentData = sentBodyData ? JSON.parse(sentBodyData) : {};
      expect(sentData.title).toBe('Updated Product');
      expect(sentData.price).toBe(39.99);
    });
    
    test('deleteProduct sends delete request', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204
      } as Response);
      
      // Act
      await productService.deleteProduct('1');
      
      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/products/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
  
  describe('Image Processing', () => {
    test('processes images during product creation', async () => {
      // Arrange
      const product: UiProduct = {
        name: 'Test Product',
        description: 'A test product with images',  // Required field
        price: 19.99, 
        imageUrls: ['/existing-image.jpg', 'data:image/png;base64,abc123'],
        available: true
      };
      
      // Define uploadImageToCdn on the global object
      Object.defineProperty(global, 'uploadImageToCdn', {
        value: jest.fn().mockImplementation(
          (_imageUrl: string, productId: string, index: number) => 
            Promise.resolve(`/shop-assets/products/${productId}-${index}.jpg`)
        ),
        writable: true,
      });
      
      // Mock the API response in camelCase format with all necessary fields
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: '1',
          title: 'Test Product',
          description: 'A test product with images',
          price: 19.99,
          previewImageUrls: JSON.stringify(['/processed-image.jpg'])
        }),
        status: 201
      } as Response);
      
      // Act
      await productService.createProduct(product);
      
      // Assert
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    
    test('creates product with base64 images in the payload', async () => {
      // Arrange
      const product: UiProduct = {
        name: 'Test Product',
        description: 'A product with base64 image data',
        price: 25.99,
        // Include base64 encoded image data in the request
        imageUrls: ['data:image/png;base64,abc123'],
        available: true
      };
      
      // Setup response mock - API should accept the product
      (global.fetch as jest.Mock).mockImplementationOnce((url, options) => {
        // Capture the request body to verify image handling
        const requestBody = JSON.parse(options.body as string);
        expect(requestBody.title).toBe('Test Product');
        expect(requestBody.description).toBe('A product with base64 image data');
        expect(requestBody.previewImageUrls).toBeDefined();
        
        // Create response in UI format that service will return
        const responseProduct: UiProduct = {
          id: '100',
          name: 'Test Product',
          description: 'A product with base64 image data',
          price: 25.99,
          imageUrls: ['/cdn/images/100-0.jpg'],
          available: true
        };
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(responseProduct),
          status: 201
        } as Response);
      });
      
      // Act
      const result = await productService.createProduct(product);
      
      // Assert
      expect(result).toBeDefined();
      // Verify that API was called with proper content
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/products'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Bearer')
          })
        })
      );
      
      // Verify the response was processed in consistent UI format
      expect(result.id).toBe('100'); 
      expect(result.name).toBe('Test Product');
      expect(result.description).toBe('A product with base64 image data');
    });
  });
});
