import { configureStore } from '@reduxjs/toolkit';
import categoriesReducer, {
  fetchCategories
} from '../categoriesSlice';
import { categoryService } from '../../../services/categoryService';
import { UiCategory } from '../../../models/category';

// Define types for the mock service
interface MockCategoryService {
  getAllCategories: jest.Mock;
  getCategoryById: jest.Mock;
  createCategory: jest.Mock;
}

// Mock the category service
jest.mock('../../../services/categoryService', () => ({
  categoryService: {
    getAllCategories: jest.fn(),
    getCategoryById: jest.fn(),
    createCategory: jest.fn()
  }
}));

describe('Categories Slice', () => {
  // Helper function to create a test store with correct typing
  const createTestStore = () => {
    return configureStore({
      reducer: {
        categories: categoriesReducer
      }
    });
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    test('has correct initial state', () => {
      // Arrange
      const store = createTestStore();
      const state = store.getState().categories;
      
      // Assert against expected state shape without direct reference comparison
      // Instead of comparing to imported initialState, verify each property
      expect(state.categories).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.selectedCategory).toBe(null);
    });
  });

  describe('fetchCategories', () => {
    test('fetches categories successfully', async () => {
      // Arrange
      const store = createTestStore();
      const mockCategories: UiCategory[] = [
        { id: 1, name: 'Category 1', description: '', path: 'Category 1' },
        { id: 2, name: 'Category 2', description: '', parentCategoryId: 1, path: 'Category 1 > Category 2' }
      ];
      
      // Type cast to access the mock function
      const mockCategoryService = categoryService as unknown as MockCategoryService;
      mockCategoryService.getAllCategories.mockResolvedValue(mockCategories);
      
      // Act
      await store.dispatch(fetchCategories());
      
      // Assert
      const state = store.getState().categories;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.categories).toEqual(mockCategories);
      expect(mockCategoryService.getAllCategories).toHaveBeenCalledTimes(1);
    });

    test('handles fetch errors', async () => {
      // Arrange
      const store = createTestStore();
      const errorMessage = 'Failed to fetch categories';
      
      // Type cast to access the mock function
      const mockCategoryService = categoryService as unknown as MockCategoryService;
      mockCategoryService.getAllCategories.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await store.dispatch(fetchCategories());
      
      // Assert
      const state = store.getState().categories;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.categories).toEqual([]);
    });

    test('sets loading state correctly', async () => {
      // Arrange
      const store = createTestStore();
      const mockCategories: UiCategory[] = [
        { id: 1, name: 'Category 1', description: '' },
        { id: 2, name: 'Category 2', description: '', parentCategoryId: 1 }
      ];
      
      // Use a delayed promise to check loading state
      let resolvePromise: (value: typeof mockCategories) => void;
      const promise = new Promise<typeof mockCategories>(resolve => {
        resolvePromise = resolve;
      });
      
      // Type cast to access the mock function
      const mockCategoryService = categoryService as unknown as MockCategoryService;
      mockCategoryService.getAllCategories.mockReturnValue(promise);
      
      // Act
      const action = store.dispatch(fetchCategories());
      
      // Assert - Check loading state is true during fetch
      let state = store.getState().categories;
      expect(state.loading).toBe(true);
      
      // Resolve the promise
      resolvePromise!(mockCategories);
      await action;
      
      // Assert - Check loading state is false after fetch completes
      state = store.getState().categories;
      expect(state.loading).toBe(false);
      expect(state.categories).toEqual(mockCategories);
    });
  });

  describe('edge cases', () => {
    test('handles empty categories array', async () => {
      // Arrange
      const store = createTestStore();
      
      // Type cast to access the mock function
      const mockCategoryService = categoryService as unknown as MockCategoryService;
      mockCategoryService.getAllCategories.mockResolvedValue([]);
      
      // Act
      await store.dispatch(fetchCategories());
      
      // Assert
      const state = store.getState().categories;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.categories).toEqual([]);
    });

    test('clears previous error when fetch succeeds', async () => {
      // Arrange
      const store = createTestStore();
      const mockCategories = [{ id: 1, name: 'Category 1' }];
      
      // Type cast to access the mock function
      const mockCategoryService = categoryService as unknown as MockCategoryService;
      
      // First, cause an error
      mockCategoryService.getAllCategories.mockRejectedValueOnce(new Error('API error'));
      await store.dispatch(fetchCategories());
      
      // Verify we have an error
      let state = store.getState().categories;
      expect(state.error).toBe('API error');
      
      // Then, make the next call succeed
      mockCategoryService.getAllCategories.mockResolvedValueOnce(mockCategories);
      
      // Act
      await store.dispatch(fetchCategories());
      
      // Assert
      state = store.getState().categories;
      expect(state.error).toBe(null);
      expect(state.categories).toEqual(mockCategories);
    });
  });
});
