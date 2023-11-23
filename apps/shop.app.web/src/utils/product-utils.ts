import { ProductItem } from '../model';

export const getProductImage = (product: ProductItem): string =>
  `/shop-assets/products/thumbnails/${product.id}-1.png`;

export const ProductFallbackImage = '/shop-assets/products/no-product-image.png';
