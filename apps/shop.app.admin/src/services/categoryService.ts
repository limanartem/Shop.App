const API_URL = process.env.REACT_APP_CATALOG_API_URL;

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

export interface Category {
  id: number;
  name: string;
  description?: string;
  parentCategoryId?: number | null;
  path?: string; // Full path including parents
}

export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
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
    
    const apiCategories = await response.json();
    
    // Debug: Log the raw response from the API
    console.log('Raw categories from API:', apiCategories);
    
    // Map API field names to UI field names
    const mappedCategories = apiCategories.map((apiCategory: any) => {
      // Debug: Log each category object
      console.log('Processing category:', apiCategory);
      
      const mappedCategory = {
        id: apiCategory.id || apiCategory.Id,
        name: apiCategory.title || apiCategory.Title || apiCategory.Name || apiCategory.name, // Handle all possible cases
        description: apiCategory.Description || apiCategory.description,
        parentCategoryId: apiCategory.parentCategoryId || apiCategory.ParentCategoryId,
      };
      
      // Debug: Log the mapped category
      console.log('Mapped category:', mappedCategory);
      
      return mappedCategory;
    });
    
    // Build category paths
    return this.buildCategoryPaths(mappedCategories);
  },

  // Builds full path for each category based on parent-child relationships
  buildCategoryPaths(categories: Category[]): Category[] {
    // Create a map for quick lookup
    const categoryMap = new Map<number, Category>();
    categories.forEach(category => categoryMap.set(category.id, { ...category }));
    
    // Function to get the full path of a category
    const getCategoryPath = (category: Category): string => {
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
  }
};
