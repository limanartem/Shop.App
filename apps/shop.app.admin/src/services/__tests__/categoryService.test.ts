/**
 * Tests for CategoryService
 * Following Shop.App admin code style guidelines
 */
import { categoryService } from '../categoryService';
import { ApiCategory, UiCategory } from '../../models/category';

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
      // Arrange - Mock API response using camelCase format
      const mockApiCategories: ApiCategory[] = [
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
    
    test('getCategoryById returns category in UI format', async () => {
      // Arrange
      const mockApiCategory: ApiCategory = { 
        id: 1, 
        title: 'Category 1', 
        description: 'Test Description', 
        parentCategoryId: null 
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiCategory),
        status: 200
      } as Response);
      
      // Act
      const category = await categoryService.getCategoryById(1);
      
      // Assert
      expect(category).toBeDefined();
      expect(category.id).toBe(1);
      expect(category.name).toBe('Category 1');
      expect(category.description).toBe('Test Description');
      expect(category.parentCategoryId).toBeNull();
    });
    
    test('createCategory sends correct data format', async () => {
      // Arrange
      const newCategory: Partial<UiCategory> = {
        name: 'New Category',
        description: 'Test Description',
        parentCategoryId: 1
      };
      
      const mockApiResponse: ApiCategory = {
        id: 3,
        title: 'New Category',
        description: 'Test Description',
        parentCategoryId: 1
      };
      
      let requestBody: string | undefined;
      
      (global.fetch as jest.Mock).mockImplementationOnce((url, options) => {
        requestBody = options.body as string;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponse),
          status: 201
        } as Response);
      });
      
      // Act
      const result = await categoryService.createCategory(newCategory);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(3);
      expect(result.name).toBe('New Category');
      
      // Verify request format
      expect(requestBody).toBeDefined();
      const sentData = requestBody ? JSON.parse(requestBody) : {};
      expect(sentData.title).toBe('New Category');
      expect(sentData.description).toBe('Test Description');
      expect(sentData.parentCategoryId).toBe(1);
    });
  });
  
  describe('buildCategoryPaths', () => {
    test('builds category paths correctly', async () => {
      // Arrange - Create test categories
      const testCategories: UiCategory[] = [
        { id: 1, name: 'Electronics', description: '', parentCategoryId: null },
        { id: 2, name: 'Computers', description: '', parentCategoryId: 1 },
        { id: 3, name: 'Laptops', description: '', parentCategoryId: 2 }
      ];
      
      // Act
      const result = categoryService.buildCategoryPaths(testCategories);
      
      // Assert
      expect(result.length).toBe(3);
      expect(result[0].path).toBe('Electronics');
      expect(result[1].path).toBe('Electronics > Computers');
      expect(result[2].path).toBe('Electronics > Computers > Laptops');
    });
    
    test('handles missing parents gracefully', () => {
      // Arrange - Category with non-existent parent
      const categories: UiCategory[] = [
        { id: 2, name: 'Orphan', description: '', parentCategoryId: 999 }
      ];
      
      // Act
      const result = categoryService.buildCategoryPaths(categories);
      
      // Assert - Should just use the category name as path since parent not found
      expect(result[0].path).toBe('Orphan');
    });
    
    test('handles empty array', () => {
      // Arrange
      const categories: UiCategory[] = [];
      
      // Act
      const result = categoryService.buildCategoryPaths(categories);
      
      // Assert
      expect(result).toEqual([]);
    });
  });
});
