import { ProductItem } from '../model';
import env from '../config/environment';

const { REACT_APP_CDN_URL } = env;

export const getProductImage = (product: ProductItem, index: number = 1): string =>
  `${REACT_APP_CDN_URL}/shop-assets/products/thumbnails/${product.id}-${index}.png`;

export const ProductFallbackImage = `${REACT_APP_CDN_URL}/shop-assets/products/no-product-image.png`;
