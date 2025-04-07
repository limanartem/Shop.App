const API_URL = process.env.REACT_APP_CATALOG_API_URL;

export const productService = {
  async getAllProducts() {
    const response = await fetch(`${API_URL}/api/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return response.json();
  },

  async createProduct(product: any) {
    const response = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error('Failed to create product');
    }
    return response.json();
  },

  async updateProduct(product: any) {
    const response = await fetch(`${API_URL}/api/products/${product.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error('Failed to update product');
    }
    return response.json();
  },
};
