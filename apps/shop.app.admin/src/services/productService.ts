import { ApiProduct, UiProduct, mapApiToUiProduct, mapUiToApiProduct } from '../models/product';

const API_URL = process.env.REACT_APP_CATALOG_API_URL;
// CDN URL is used in the component that consumes these image URLs

// Helper function to upload image to the CDN
const uploadImageToCdn = async (imageDataUrl: string, productId: string, index: number): Promise<string> => {
  // For this prototype, we're using a simplified approach where we'll just return
  // the filename that would be created on the CDN
  // In a real implementation, you would make an API call to upload the image
  // and get back the URL where it's stored
  
  // This simulates the process of transforming a base64 image to a CDN URL
  const fileName = `/shop-assets/products/thumbnails/${productId}-${index}.png`;
  
  // In a real implementation, you would do something like:
  // const response = await fetch(`${API_URL}/api/upload`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ image: imageDataUrl, productId })
  // });
  // const data = await response.json();
  // return data.url;
  
  return fileName;
};

/**
 * Processes image uploads to CDN and returns array of image URLs
 * @param product - Product containing image data URLs
 * @returns Array of processed image URLs
 */
const processProductImages = async (product: UiProduct): Promise<string[]> => {
  if (!product.imageUrls || !product.imageUrls.length) {
    return [];
  }
  
  const cdnUrls = [];
  
  for (let i = 0; i < product.imageUrls.length; i++) {
    const imageUrl = product.imageUrls[i];
    
    // If it's already a CDN URL, keep it as is
    if (!imageUrl.startsWith('data:')) {
      cdnUrls.push(imageUrl);
      continue;
    }
    
    // If it's a new image (data URL), upload it
    try {
      const uploadedUrl = await uploadImageToCdn(imageUrl, product.id || 'temp', i);
      cdnUrls.push(uploadedUrl);
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  }
  
  return cdnUrls;
};

// Helper function to get auth token
const getAuthToken = () => {
  // This would be replaced with your actual token storage mechanism
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

export const productService = {
  /**
   * Fetches all products from the catalog API
   * @returns Array of products in UI format
   */
  async getAllProducts(): Promise<UiProduct[]> {
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
    
    // Get products in API format
    const apiProducts: ApiProduct[] = await response.json();
    
    // Map to UI format
    return apiProducts.map(mapApiToUiProduct);
  },

  /**
   * Fetches a single product by ID
   * @param id - Product ID to fetch
   * @returns Product in UI format
   */
  async getProductById(id: string): Promise<UiProduct> {
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
      if (response.status === 404) {
        throw new Error('Product not found');
      }
      throw new Error('Failed to fetch product');
    }
    
    const apiProduct: ApiProduct = await response.json();
    
    // Map API product to UI product
    return mapApiToUiProduct(apiProduct);
  },

  /**
   * Creates a new product
   * @param product - Product data from UI
   * @returns Created product in UI format
   */
  async createProduct(product: UiProduct): Promise<UiProduct> {
    const token = getAuthToken();
    
    // Process images first if any exist
    const processedImageUrls = await processProductImages(product);
    
    // Create a copy of the product with processed images
    const productWithImages: UiProduct = {
      ...product,
      imageUrls: processedImageUrls
    };
    
    // Map UI product to API format
    const apiProduct = mapUiToApiProduct(productWithImages);
    
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

  /**
   * Updates an existing product
   * @param product - Product data from UI, must include ID
   * @returns Updated product in UI format
   */
  async updateProduct(product: UiProduct): Promise<UiProduct> {
    const token = getAuthToken();
    
    // Ensure we have an ID
    if (!product.id) {
      throw new Error('Product ID is required');
    }
    
    // Process images first if any exist
    const processedImageUrls = await processProductImages(product);
    
    // Create a copy of the product with processed images
    const productWithImages: UiProduct = {
      ...product,
      imageUrls: processedImageUrls.length > 0 ? processedImageUrls : product.imageUrls
    };
    
    // Map UI product to API format and add ID
    const apiProduct = {
      id: product.id,
      ...mapUiToApiProduct(productWithImages)
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
  
  /**
   * Deletes a product by ID
   * @param id - ID of product to delete
   * @returns true if deletion was successful
   */
  async deleteProduct(id: string): Promise<boolean> {
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
