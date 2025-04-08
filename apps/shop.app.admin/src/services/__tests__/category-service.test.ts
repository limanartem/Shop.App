import { categoryService, Category } from '../categoryService';

// Tests for category service

describe('CategoryService', () => {
  beforeEach(() => {
    // Reset the fetch mock before each test
    (global.fetch as jest.Mock).mockReset();
    
    // Ensure consistent authentication token mocking
    jest.spyOn(window.localStorage, 'getItem').mockImplementation((key) => {
      if (key === 'authToken') return 'test-token';
      return null;
    });
    
    // Also mock sessionStorage for complete coverage
    jest.spyOn(window.sessionStorage, 'getItem').mockImplementation((key) => {
      if (key === 'authToken') return 'test-token';
      return null;
    });
  });

  describe('getAllCategories', () => {
    test('fetches and transforms categories from the API', async () => {
      // Arrange
      const mockCategories = [
        { id: 1, title: 'Category 1', parentCategoryId: null },
        { id: 2, title: 'Category 2', parentCategoryId: 1 },
        { id: 3, title: 'Category 3', parentCategoryId: 1 },
      ];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCategories),
        status: 200
      } as Response);

      // Act
      const result = await categoryService.getAllCategories();

      // Assert
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/productCategories'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
      expect(result.length).toBe(3);
      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe('Category 1');
      expect(result[1].id).toBe(2);
      expect(result[1].name).toBe('Category 2');
    });

    test('handles API errors correctly', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'));

      // Act & Assert
      await expect(categoryService.getAllCategories()).rejects.toThrow('API error');
    });

    test('handles empty response correctly', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
        status: 200
      } as Response);

      // Act
      const result = await categoryService.getAllCategories();

      // Assert
      expect(result).toEqual([]);
    });

    test('handles authentication errors', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Unauthorized' }),
        status: 401
      } as Response);

      // Act & Assert
      await expect(categoryService.getAllCategories()).rejects.toThrow('Authentication required');
    });
  });

  describe('buildCategoryPaths', () => {
    test('builds correct paths for categories with simple hierarchy', () => {
      // Arrange
      const categories: Category[] = [
        { id: 1, name: 'Electronics', parentCategoryId: null },
        { id: 2, name: 'Smartphones', parentCategoryId: 1 },
        { id: 3, name: 'Laptops', parentCategoryId: 1 },
      ];

      // Act
      const result = categoryService.buildCategoryPaths(categories);

      // Assert
      expect(result.length).toBe(3);
      expect(result[0].path).toBe('Electronics');
      expect(result[1].path).toBe('Electronics > Smartphones');
      expect(result[2].path).toBe('Electronics > Laptops');
    });

    test('builds correct paths for multi-level hierarchy', () => {
      // Arrange
      const categories: Category[] = [
        { id: 1, name: 'Electronics', parentCategoryId: null },
        { id: 2, name: 'Smartphones', parentCategoryId: 1 },
        { id: 3, name: 'Apple', parentCategoryId: 2 },
        { id: 4, name: 'iPhone', parentCategoryId: 3 },
      ];

      // Act
      const result = categoryService.buildCategoryPaths(categories);

      // Assert
      expect(result.length).toBe(4);
      expect(result[0].path).toBe('Electronics');
      expect(result[1].path).toBe('Electronics > Smartphones');
      expect(result[2].path).toBe('Electronics > Smartphones > Apple');
      expect(result[3].path).toBe('Electronics > Smartphones > Apple > iPhone');
    });

    test('handles categories with missing parent', () => {
      // Arrange
      const categories: Category[] = [
        { id: 1, name: 'Electronics', parentCategoryId: null },
        { id: 2, name: 'Smartphones', parentCategoryId: 1 },
        { id: 3, name: 'Orphaned Category', parentCategoryId: 999 }, // Parent doesn't exist
      ];

      // Act
      const result = categoryService.buildCategoryPaths(categories);

      // Assert
      expect(result.length).toBe(3);
      expect(result[0].path).toBe('Electronics');
      expect(result[1].path).toBe('Electronics > Smartphones');
      expect(result[2].path).toBe('Orphaned Category'); // Just the category name since parent is missing
    });

    test('preserves original category properties', () => {
      // Arrange
      const categories: Category[] = [
        { id: 1, name: 'Category 1', description: 'Desc 1', parentCategoryId: null },
        { id: 2, name: 'Category 2', description: 'Desc 2', parentCategoryId: 1 },
      ];

      // Act
      const result = categoryService.buildCategoryPaths(categories);

      // Assert
      expect(result.length).toBe(2);
      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe('Category 1');
      expect(result[0].description).toBe('Desc 1');
      expect(result[1].id).toBe(2);
      expect(result[1].name).toBe('Category 2');
      expect(result[1].description).toBe('Desc 2');
    });
  });
});
