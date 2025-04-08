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
    
    return response.json();
  },

  async createProduct(product: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(product),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      throw new Error('Failed to create product');
    }
    
    return response.json();
  },

  async updateProduct(product: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/products/${product.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(product),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      throw new Error('Failed to update product');
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
