import { ApiCategory, UiCategory, mapApiToUiCategory } from '../models/category';

const API_URL = process.env.REACT_APP_CATALOG_API_URL;

/**
 * Helper function to get auth token from storage
 * @returns Authentication token or null if not available
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

/**
 * Service for category-related API operations
 */
export const categoryService = {
  /**
   * Fetches all categories from the API
   * @returns Promise resolving to array of categories in UI format
   */
  async getAllCategories(): Promise<UiCategory[]> {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/productCategories`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 401 || response.status === 403) {
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const apiCategories = await response.json() as ApiCategory[];
    
    // Debug: Log the raw response from the API
    console.log('Raw categories from API:', apiCategories);
    
    // Map API categories to UI format using our standardized mapper
    const mappedCategories = apiCategories.map((apiCategory: ApiCategory) => {
      // Debug: Log each category object
      console.log('Processing category:', apiCategory);
      
      const mappedCategory = mapApiToUiCategory(apiCategory);
      
      // Debug: Log the mapped category
      console.log('Mapped category:', mappedCategory);
      
      return mappedCategory;
    });
    
    // Build category paths
    return this.buildCategoryPaths(mappedCategories);
  },

  /**
   * Builds full path for each category based on parent-child relationships
   * @param categories Array of categories to process
   * @returns Categories with path property populated
   */
  buildCategoryPaths(categories: UiCategory[]): UiCategory[] {
    // Create a map for quick lookup
    const categoryMap = new Map<number, UiCategory>();
    categories.forEach(category => categoryMap.set(category.id, { ...category }));
    
    // Function to get the full path of a category
    const getCategoryPath = (category: UiCategory): string => {
      if (!category.parentCategoryId) {
        return category.name;
      }
      
      const parent = categoryMap.get(category.parentCategoryId);
      if (!parent) {
        return category.name;
      }
      
      return `${getCategoryPath(parent)} > ${category.name}`;
    };
    
    // Add path to each category
    const categoriesWithPaths = categories.map(category => {
      const result = { ...category };
      result.path = getCategoryPath(category);
      return result;
    });
    
    return categoriesWithPaths;
  },
  
  /**
   * Fetches a single category by ID
   * @param id Category ID to fetch
   * @returns Promise resolving to category in UI format
   */
  async getCategoryById(id: number): Promise<UiCategory> {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/productCategories/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 404) {
      throw new Error(`Category with ID ${id} not found`);
    }
    
    if (response.status === 401 || response.status === 403) {
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch category with ID ${id}`);
    }
    
    const apiCategory = await response.json() as ApiCategory;
    return mapApiToUiCategory(apiCategory);
  },
  
  /**
   * Creates a new category
   * @param category Category data in UI format (partial, as id is assigned by the server)
   * @returns Promise resolving to the created category in UI format
   */
  async createCategory(category: Partial<UiCategory>): Promise<UiCategory> {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/productCategories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: category.name,
        description: category.description,
        parentCategoryId: category.parentCategoryId
      })
    });
    
    if (response.status === 401 || response.status === 403) {
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      throw new Error('Failed to create category');
    }
    
    const apiCategory = await response.json() as ApiCategory;
    return mapApiToUiCategory(apiCategory);
  }
};
