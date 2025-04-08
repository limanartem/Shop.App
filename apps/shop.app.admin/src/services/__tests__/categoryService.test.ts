/**
 * Tests for CategoryService
 * Following Shop.App admin code style guidelines
 */
import { categoryService, Category } from '../categoryService';

describe('CategoryService', () => {
  beforeEach(() => {
    // Reset fetch mock between tests
    (global.fetch as jest.Mock).mockReset();
    
    // Mock the auth token consistently
    jest.spyOn(window.localStorage, 'getItem').mockImplementation((key) => {
      if (key === 'authToken') return 'test-token';
      return null;
    });
    
    jest.spyOn(window.sessionStorage, 'getItem').mockImplementation((key) => {
      if (key === 'authToken') return 'test-token';
      return null;
    });
  });
  
  describe('getAllCategories', () => {
    test('fetches and maps categories correctly', async () => {
      // Arrange - Mock API response using .NET format (PascalCase)
      const mockApiCategories = [
        { 
          id: 1, 
          title: 'Category 1', 
          description: 'Test Description 1', 
          parentCategoryId: null 
        },
        { 
          id: 2, 
          title: 'Category 2', 
          description: 'Test Description 2', 
          parentCategoryId: 1 
        }
      ];
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiCategories),
        status: 200
      } as Response);
      
      // Act
      const categories = await categoryService.getAllCategories();
      
      // Assert
      expect(categories).toBeDefined();
      expect(categories.length).toBe(2);
      
      // Verify first category mapping
      expect(categories[0].id).toBe(1);
      expect(categories[0].name).toBe('Category 1');
      expect(categories[0].description).toBe('Test Description 1');
      expect(categories[0].parentCategoryId).toBeNull();
      
      // Verify second category mapping with parent relationship
      expect(categories[1].id).toBe(2);
      expect(categories[1].name).toBe('Category 2');
      expect(categories[1].description).toBe('Test Description 2');
      expect(categories[1].parentCategoryId).toBe(1);
      
      // Verify API call details
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/productCategories'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });
    
    test('throws error for failed API requests', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response);
      
      // Act & Assert
      await expect(categoryService.getAllCategories()).rejects.toThrow('Failed to fetch categories');
    });

    test('throws authentication error for 401 status', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401
      } as Response);
      
      // Act & Assert
      await expect(categoryService.getAllCategories()).rejects.toThrow('Authentication required');
    });
    
    test('handles empty categories array', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
        status: 200
      } as Response);
      
      // Act
      const categories = await categoryService.getAllCategories();
      
      // Assert
      expect(categories).toEqual([]);
    });
  });
  
  describe('buildCategoryPaths', () => {
    test('builds paths for categories correctly', () => {
      // Arrange
      const categories: Category[] = [
        { id: 1, name: 'Root', parentCategoryId: null },
        { id: 2, name: 'Child', parentCategoryId: 1 },
        { id: 3, name: 'Grandchild', parentCategoryId: 2 }
      ];
      
      // Act
      const result = categoryService.buildCategoryPaths(categories);
      
      // Assert
      expect(result.length).toBe(3);
      expect(result[0].path).toBe('Root');
      expect(result[1].path).toBe('Root > Child');
      expect(result[2].path).toBe('Root > Child > Grandchild');
    });
    
    test('handles missing parents gracefully', () => {
      // Arrange - Category with non-existent parent
      const categories: Category[] = [
        { id: 2, name: 'Orphan', parentCategoryId: 999 }
      ];
      
      // Act
      const result = categoryService.buildCategoryPaths(categories);
      
      // Assert - Should just use the category name as path since parent not found
      expect(result[0].path).toBe('Orphan');
    });
    
    test('handles empty array', () => {
      // Arrange
      const categories: Category[] = [];
      
      // Act
      const result = categoryService.buildCategoryPaths(categories);
      
      // Assert
      expect(result).toEqual([]);
    });
  });
});
