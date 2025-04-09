/**
 * Tests for the category model
 * Following Shop.App admin code style guidelines
 */
import { mapApiToUiCategory, mapUiToApiCategory, ApiCategory, UiCategory } from '../category';

describe('Category Model', () => {
  describe('mapApiToUiCategory', () => {
    test('maps API category to UI category correctly', () => {
      // Arrange
      const apiCategory: ApiCategory = {
        id: 5,
        title: 'Test Category',
        description: 'Test Description',
        parentCategoryId: 3
      };

      // Act
      const result = mapApiToUiCategory(apiCategory);

      // Assert
      expect(result).toEqual({
        id: 5,
        name: 'Test Category',
        description: 'Test Description',
        parentCategoryId: 3
      });
    });

    test('handles null parentCategoryId', () => {
      // Arrange
      const apiCategory: ApiCategory = {
        id: 5,
        title: 'Test Category',
        description: 'Test Description',
        parentCategoryId: null
      };

      // Act
      const result = mapApiToUiCategory(apiCategory);

      // Assert
      expect(result.parentCategoryId).toBeNull();
    });

    test('handles undefined description', () => {
      // Arrange
      const apiCategory: ApiCategory = {
        id: 5,
        title: 'Test Category',
        parentCategoryId: null
      };

      // Act
      const result = mapApiToUiCategory(apiCategory);

      // Assert
      expect(result.description).toBeUndefined();
    });
  });

  describe('mapUiToApiCategory', () => {
    test('maps UI category to API category correctly', () => {
      // Arrange
      const uiCategory: UiCategory = {
        id: 5,
        name: 'Test Category',
        description: 'Test Description',
        parentCategoryId: 3,
        path: 'Parent > Test Category'
      };

      // Act
      const result = mapUiToApiCategory(uiCategory);

      // Assert
      expect(result).toEqual({
        title: 'Test Category',
        description: 'Test Description',
        parentCategoryId: 3
      });
    });

    test('handles undefined parentCategoryId with null default', () => {
      // Arrange
      const uiCategory: UiCategory = {
        id: 5,
        name: 'Test Category',
        description: 'Test Description'
      };

      // Act
      const result = mapUiToApiCategory(uiCategory);

      // Assert
      expect(result.parentCategoryId).toBeNull();
    });

    test('handles undefined description', () => {
      // Arrange
      const uiCategory: UiCategory = {
        id: 5,
        name: 'Test Category',
        parentCategoryId: null
      };

      // Act
      const result = mapUiToApiCategory(uiCategory);

      // Assert
      expect(result.description).toBeUndefined();
    });
  });
});
