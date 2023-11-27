import { ProductItem } from '../model';

export const getProductImage = (product: ProductItem, index: number = 1): string =>
  `/shop-assets/products/thumbnails/${product.id}-${index}.png`;

export const ProductFallbackImage = '/shop-assets/products/no-product-image.png';
