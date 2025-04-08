/**
 * Product-related interfaces
 * Following Shop.App admin code style guidelines
 */

/**
 * Represents a product as returned from the Catalog API
 * All fields use camelCase as per API specification
 */
export interface ApiProduct {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  categoryId?: number;
  previewImageUrls?: string; // JSON string of image URLs
}

/**
 * Represents a product as used in the UI layer
 * Maps API fields to frontend-friendly naming
 */
export interface UiProduct {
  id?: string;
  name: string;          // Mapped from API's 'title'
  description: string;   // Made non-optional to match existing components
  price: number;
  categoryId?: number;
  imageUrls?: string[];  // Parsed from API's JSON string
  available: boolean;    // Frontend-only field
}

/**
 * Maps a product from API format to UI format
 * @param apiProduct - Product data from the API
 * @returns Product formatted for UI consumption
 */
export function mapApiToUiProduct(apiProduct: ApiProduct): UiProduct {
  let imageUrls: string[] = [];
  
  // Parse image URLs if they exist
  if (apiProduct.previewImageUrls) {
    try {
      imageUrls = JSON.parse(apiProduct.previewImageUrls);
    } catch (e) {
      console.error('Failed to parse image URLs', e);
    }
  }
  
  return {
    id: apiProduct.id,
    name: apiProduct.title,
    description: apiProduct.description || '', // Provide empty string default for non-optional field
    price: apiProduct.price,
    categoryId: apiProduct.categoryId,
    imageUrls,
    available: true // Default value since API doesn't have this field
  };
}

/**
 * Maps a product from UI format to API format for sending in requests
 * @param uiProduct - Product data from the UI
 * @returns Product formatted for API consumption
 */
export function mapUiToApiProduct(uiProduct: UiProduct): Omit<ApiProduct, 'id'> {
  return {
    title: uiProduct.name,
    description: uiProduct.description,
    price: uiProduct.price,
    currency: 'USD', // Default currency since UI doesn't collect it
    categoryId: uiProduct.categoryId,
    previewImageUrls: uiProduct.imageUrls?.length 
      ? JSON.stringify(uiProduct.imageUrls)
      : undefined
  };
}
