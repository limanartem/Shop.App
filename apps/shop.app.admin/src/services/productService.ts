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

// Helper function to process image uploads
const processProductImages = async (product: any): Promise<string[]> => {
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
    const imageUrls = apiProduct.PreviewImageUrls || apiProduct.previewImageUrls;
    let parsedImageUrls = [];
    
    // Try to parse the image URLs if they exist
    if (imageUrls) {
      try {
        parsedImageUrls = JSON.parse(imageUrls);
      } catch (e) {
        console.warn('Failed to parse image URLs:', e);
      }
    }
    
    return {
      id: apiProduct.id || apiProduct.Id,
      name: apiProduct.title || apiProduct.Title || apiProduct.Name || apiProduct.name, // Handle PascalCase and different field names from .NET
      description: apiProduct.Description || apiProduct.description,
      price: apiProduct.Price || apiProduct.price,
      categoryId: apiProduct.CategoryId || apiProduct.categoryId,
      imageUrls: parsedImageUrls,
      available: true, // Default value since this field doesn't exist in the API
    };
  },

  async createProduct(product: any) {
    const token = getAuthToken();
    
    // Process images first if any exist
    const processedImageUrls = await processProductImages(product);
    
    // Map UI field names to API field names
    const apiProduct = {
      Title: product.name,
      Description: product.description,
      Price: product.price,
      Currency: 'USD', // Default currency since UI doesn't collect it
      CategoryId: product.categoryId || 1, // Default category if not provided
      // Handle image uploads
      PreviewImageUrls: processedImageUrls.length > 0 ? JSON.stringify(processedImageUrls) : null
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
    
    // Process images first if any exist
    const processedImageUrls = await processProductImages(product);
    
    // Map UI field names to API field names
    const apiProduct = {
      Id: product.id,
      Title: product.name,
      Description: product.description,
      Price: product.price,
      Currency: 'USD', // Default currency since UI doesn't collect it
      CategoryId: product.categoryId || 1, // Default category if not provided
      // Handle image uploads
      PreviewImageUrls: processedImageUrls.length > 0 ? JSON.stringify(processedImageUrls) : null
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
