import { ProductCategory, ProductItem } from '../model';

const { REACT_APP_CATALOG_API_URL } = process.env;

export const getProducts = async (category?: string | null): Promise<ProductItem[]> => {
  console.log(process.env);
  console.log(`Fetching products from ${`${REACT_APP_CATALOG_API_URL}/products`}`);

  const response = await fetch(`${REACT_APP_CATALOG_API_URL}/products?categoryId=${category}`, {
    method: 'GET',
  });

  if (!response.ok) {
    console.error({ status: response.status, statusText: response.statusText });
    throw new Error('Unable to get products!');
  }

  return await response.json();
};

export const getCategories = async (): Promise<ProductCategory[]> => {
  console.log(`Fetching product categories from ${`${REACT_APP_CATALOG_API_URL}/productCategories`}`);

  const response = await fetch(`${REACT_APP_CATALOG_API_URL}/productCategories`, {
    method: 'GET',
  });

  if (!response.ok) {
    console.error({ status: response.status, statusText: response.statusText });
    throw new Error('Unable to get product categories!');
  }

  return await response.json();
};
