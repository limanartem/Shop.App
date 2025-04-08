/**
 * Comprehensive tests for ProductService
 * Following Shop.App admin code style guidelines
 */
import { productService } from '../productService';

/**
 * Interface representing the Product API response format (from .NET API)
 * Used for consistent typing in tests
 */
interface ApiProduct {
  Id: string;
  Title: string;
  Description?: string;
  Price: number;
  CategoryId?: number;
  PreviewImageUrls?: string;
}

/**
 * Interface representing the Product format in the UI/frontend
 * Used for request payloads in tests
 */
interface UiProduct {
  id?: string;
  name: string;
  description?: string;
  price: number;
  categoryId?: number;
  imageUrls?: string[];
  available: boolean;
}

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
      // Arrange - Mock API response in .NET format (PascalCase)
      const mockProducts: ApiProduct[] = [
        { 
          Id: '1', 
          Title: 'Test Product', 
          Description: 'Test description', 
          Price: 19.99, 
          CategoryId: 1,
          PreviewImageUrls: JSON.stringify(['/test.jpg']) 
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
      
      // Use type-safe property access
      const hasId = 'Id' in products[0] || 'id' in products[0];
      expect(hasId).toBe(true);
      
      // Extract id safely to handle different API formats
      const idValue = ('Id' in products[0]) ? products[0].Id : 
                     ('id' in products[0]) ? products[0].id : 
                     'undefined';
      expect(idValue).toBe('1');
      
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
      // Arrange
      const mockProduct: ApiProduct = { 
        Id: '42', 
        Title: 'Single Product', 
        Description: 'Single product description', 
        Price: 42.99, 
        CategoryId: 2 
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProduct),
        status: 200
      } as Response);
      
      // Act
      const product = await productService.getProductById('42');
      
      // Assert with type-safe property access
      expect(product).toBeDefined();
      
      // Check that the product has id properties with either format
      const hasId = 'Id' in product || 'id' in product;
      expect(hasId).toBe(true);
      
      // Extract id using a type-safe approach
      const idValue = ('Id' in product) ? (product as unknown as ApiProduct).Id : 
                     ('id' in product) ? (product as {id: string}).id : 
                     'undefined';
      expect(idValue).toBe('42');
      
      // Extract name/title using a type-safe approach
      const titleValue = ('Title' in product) ? (product as unknown as ApiProduct).Title : 
                       ('name' in product) ? (product as {name: string}).name : 
                       'undefined';
      expect(titleValue).toBe('Single Product');
      
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
      // Arrange
      const newProduct = {
        name: 'New Product',
        description: 'New description',
        price: 29.99,
        categoryId: 3,
        imageUrls: ['/test-image.jpg']
      };
      
      const apiResponse: ApiProduct = {
        Id: '123',
        Title: 'New Product',
        Description: 'New description',
        Price: 29.99,
        CategoryId: 3,
        PreviewImageUrls: JSON.stringify(['/test-image.jpg'])
      };
      
      // Capture the sent request data
      let requestBody: string | undefined;
      
      (global.fetch as jest.Mock).mockImplementationOnce((url, options) => {
        requestBody = options.body as string;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(apiResponse),
          status: 201
        } as Response);
      });
      
      // Act
      const result = await productService.createProduct(newProduct);
      
      // Assert
      const typedResult = result as unknown as ApiProduct;
      expect(typedResult.Id).toBe('123');
      
      // Verify request format
      expect(requestBody).toBeDefined();
      const sentData = requestBody ? JSON.parse(requestBody) : {};
      expect(sentData.Title).toBe('New Product');
      expect(sentData.Price).toBe(29.99);
    });
    
    test('updateProduct updates existing product', async () => {
      // Arrange
      const productToUpdate = {
        id: '1',
        name: 'Updated Product',
        description: 'Updated Description',
        price: 25.99,
        categoryId: 2,
        available: true
      };
      
      // API response format (.NET uses PascalCase)
      const apiUpdatedResponse = {
        Id: '1',
        Title: 'Updated Product',
        Description: 'Updated Description',
        Price: 25.99,
        CategoryId: 2
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
        expect.stringContaining('/api/products/1'),
        expect.objectContaining({ method: 'PUT' })
      );
      
      // Verify request data
      expect(sentBodyData).toBeDefined();
      const sentData = sentBodyData ? JSON.parse(sentBodyData) : {};
      expect(sentData.Title).toBe('Updated Product');
      expect(sentData.Price).toBe(25.99);
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
      const product = {
        id: '1',
        name: 'Test Product',
        imageUrls: ['/existing-image.jpg', 'data:image/png;base64,abc123']
      };
      
      // Define uploadImageToCdn on the global object
      Object.defineProperty(global, 'uploadImageToCdn', {
        value: jest.fn().mockImplementation(
          (_imageUrl: string, productId: string, index: number) => 
            Promise.resolve(`/shop-assets/products/${productId}-${index}.jpg`)
        ),
        writable: true,
      });
      
      // Mock the API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          Id: '1',
          Title: 'Test Product',
          PreviewImageUrls: JSON.stringify(['/processed-image.jpg'])
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
        // Verify that the request body contains image data
        const requestBody = JSON.parse(options.body as string);
        expect(requestBody.Title).toBe('Test Product');
        expect(requestBody.PreviewImageUrls).toBeDefined();
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            Id: '100',
            Title: 'Test Product',
            Description: 'A product with base64 image data',
            Price: 25.99,
            // The API would typically process images and return URLs
            PreviewImageUrls: JSON.stringify(['/cdn/images/100-0.jpg'])
          }),
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
      
      // Verify the response was processed - using a non-conditional approach
      const idValue = ('Id' in result) 
        ? (result as ApiProduct).Id 
        : ('id' in result)
          ? (result as {id: string}).id
          : '';
      expect(idValue).toBe('100');
    });
  });
});
