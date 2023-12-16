import { ProductCategory, ProductItem } from '../model';
import env from '../config/environment';

const { REACT_APP_CATALOG_API_URL } = env;

export const getProductsAsync = async ({
  category,
  ids,
} : {
  category?: string | null;
  ids?: string[];
} ): Promise<ProductItem[]> => {
  console.log(
    `Fetching products from ${`${REACT_APP_CATALOG_API_URL}/products?categoryId=${category || ''}`}`,
  );

  const response = !ids?.length
    ? await fetch(`${REACT_APP_CATALOG_API_URL}/products?categoryId=${category ? category : ''}`, {
        method: 'GET',
      })
    : await fetch(`${REACT_APP_CATALOG_API_URL}/products/search}`, {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });

  if (!response.ok) {
    console.error({ status: response.status, statusText: response.statusText });
    throw new Error('Unable to get products!');
  }

  return await response.json();
};

export const getCategoriesAsync = async (): Promise<ProductCategory[]> => {
  console.log(`Fetching categories from ${`${REACT_APP_CATALOG_API_URL}/productCategories`}`);

  const response = await fetch(`${REACT_APP_CATALOG_API_URL}/productCategories`, {
    method: 'GET',
  });

  if (!response.ok) {
    console.error({ status: response.status, statusText: response.statusText });
    throw new Error('Unable to get product categories!');
  }

  return await response.json();
};
