const API_URL = process.env.REACT_APP_CATALOG_API_URL;
const AUTH_API_URL = process.env.REACT_APP_AUTH_API_URL;

// Helper function to get auth token
const getAuthToken = () => {
  // This would be replaced with your actual token storage mechanism
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

export const productService = {
  async getAllProducts() {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/products`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 401 || response.status === 403) {
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    return response.json();
  },

  async getProductById(id: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 401 || response.status === 403) {
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    
    // Get the API response
    const apiProduct = await response.json();
    
    // Map API field names back to UI field names
    // Handle different possible casing in the JSON response
    return {
      id: apiProduct.id || apiProduct.Id,
      name: apiProduct.Title || apiProduct.title, // Handle PascalCase from .NET
      description: apiProduct.Description || apiProduct.description,
      price: apiProduct.Price || apiProduct.price,
      categoryId: apiProduct.CategoryId || apiProduct.categoryId,
      previewImageUrls: apiProduct.PreviewImageUrls || apiProduct.previewImageUrls,
      // Include any other fields that might be needed
    };
  },

  async createProduct(product: any) {
    const token = getAuthToken();
    
    // Map UI field names to API field names
    const apiProduct = {
      Title: product.name,
      Description: product.description,
      Price: product.price,
      Currency: 'USD', // Default currency since UI doesn't collect it
      CategoryId: product.categoryId || 1, // Default category if not provided
      // Include any other fields that might be needed
      PreviewImageUrls: product.previewImageUrls || null
    };
    
    const response = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(apiProduct),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      // Get detailed error message if available
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      } catch (err) {
        // If we can't parse the error response, throw a generic error
        throw new Error('Failed to create product');
      }
    }
    
    return response.json();
  },

  async updateProduct(product: any) {
    const token = getAuthToken();
    
    // Map UI field names to API field names
    const apiProduct = {
      Id: product.id,
      Title: product.name,
      Description: product.description,
      Price: product.price,
      Currency: 'USD', // Default currency since UI doesn't collect it
      CategoryId: product.categoryId || 1, // Default category if not provided
      // Include any other fields that might be needed
      PreviewImageUrls: product.previewImageUrls || null
    };
    
    const response = await fetch(`${API_URL}/api/products/${product.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(apiProduct),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      // Get detailed error message if available
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      } catch (err) {
        // If we can't parse the error response, throw a generic error
        throw new Error('Failed to update product');
      }
    }
    
    return response.json();
  },
  
  async deleteProduct(id: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
    
    return true;
  },
};
