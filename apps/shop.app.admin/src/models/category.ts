/**
 * Category-related interfaces
 * Following Shop.App admin code style guidelines
 */

/**
 * Represents a category as returned from the Catalog API
 * All fields use camelCase as per API specification
 */
export interface ApiCategory {
  id: number;
  title: string;
  description?: string;
  parentCategoryId: number | null;
}

/**
 * Represents a category as used in the UI layer
 * Maps API fields to frontend-friendly naming
 */
export interface UiCategory {
  id: number;
  name: string;          // Mapped from API's 'title'
  description?: string;
  parentCategoryId?: number | null;
  path?: string;         // Derived field for UI display
}

/**
 * Maps a category from API format to UI format
 * @param apiCategory - Category data from the API
 * @returns Category formatted for UI consumption
 */
export function mapApiToUiCategory(apiCategory: ApiCategory): UiCategory {
  return {
    id: apiCategory.id,
    name: apiCategory.title,
    description: apiCategory.description,
    parentCategoryId: apiCategory.parentCategoryId,
  };
}

/**
 * Maps a category from UI format to API format for sending in requests
 * @param uiCategory - Category data from the UI
 * @returns Category formatted for API consumption
 */
export function mapUiToApiCategory(uiCategory: UiCategory): Omit<ApiCategory, 'id'> {
  return {
    title: uiCategory.name,
    description: uiCategory.description,
    parentCategoryId: uiCategory.parentCategoryId || null,
  };
}
