/**
 * Tests for the product model
 * Following Shop.App admin code style guidelines
 */
import { mapApiToUiProduct, mapUiToApiProduct, ApiProduct, UiProduct } from '../product';

describe('Product Model', () => {
  describe('mapApiToUiProduct', () => {
    test('maps API product to UI product correctly', () => {
      // Arrange
      const apiProduct: ApiProduct = {
        id: 'prod123',
        title: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        currency: 'USD',
        categoryId: 5,
        previewImageUrls: JSON.stringify(['image1.jpg', 'image2.jpg'])
      };

      // Act
      const result = mapApiToUiProduct(apiProduct);

      // Assert
      expect(result).toEqual({
        id: 'prod123',
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        categoryId: 5,
        imageUrls: ['image1.jpg', 'image2.jpg'],
        available: true
      });
    });

    test('handles missing description with empty string default', () => {
      // Arrange
      const apiProduct: ApiProduct = {
        id: 'prod123',
        title: 'Test Product',
        price: 29.99,
        currency: 'USD'
      };

      // Act
      const result = mapApiToUiProduct(apiProduct);

      // Assert
      expect(result.description).toBe('');
    });

    test('handles invalid JSON in previewImageUrls', () => {
      // Arrange
      const apiProduct: ApiProduct = {
        id: 'prod123',
        title: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        previewImageUrls: 'invalid-json'
      };
      
      // Mock console.error to avoid test output pollution
      const originalConsoleError = console.error;
      console.error = jest.fn();

      // Act
      const result = mapApiToUiProduct(apiProduct);

      // Assert
      expect(result.imageUrls).toEqual([]);
      expect(console.error).toHaveBeenCalled();
      
      // Restore console.error
      console.error = originalConsoleError;
    });

    test('handles undefined previewImageUrls', () => {
      // Arrange
      const apiProduct: ApiProduct = {
        id: 'prod123',
        title: 'Test Product',
        description: 'Test Description',
        price: 29.99
      };

      // Act
      const result = mapApiToUiProduct(apiProduct);

      // Assert
      expect(result.imageUrls).toEqual([]);
    });
  });

  describe('mapUiToApiProduct', () => {
    test('maps UI product to API product correctly', () => {
      // Arrange
      const uiProduct: UiProduct = {
        id: 'prod123',
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        categoryId: 5,
        imageUrls: ['image1.jpg', 'image2.jpg'],
        available: true
      };

      // Act
      const result = mapUiToApiProduct(uiProduct);

      // Assert
      expect(result).toEqual({
        title: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        currency: 'USD',
        categoryId: 5,
        previewImageUrls: JSON.stringify(['image1.jpg', 'image2.jpg'])
      });
    });

    test('handles undefined imageUrls', () => {
      // Arrange
      const uiProduct: UiProduct = {
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        available: true
      };

      // Act
      const result = mapUiToApiProduct(uiProduct);

      // Assert
      expect(result.previewImageUrls).toBeUndefined();
    });

    test('handles empty imageUrls array', () => {
      // Arrange
      const uiProduct: UiProduct = {
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        imageUrls: [],
        available: true
      };

      // Act
      const result = mapUiToApiProduct(uiProduct);

      // Assert
      expect(result.previewImageUrls).toBeUndefined();
    });
  });
});
