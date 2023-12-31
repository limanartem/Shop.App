import { ProductCategory, ProductItem } from '../model';

/**
 * Represents a client for interacting with the catalog service.
 */
export class CatalogServiceClient {
  private catalogApiUrl: string;

  constructor(env: Record<string, string>) {
    const { REACT_APP_CATALOG_API_URL } = env;
    this.catalogApiUrl = REACT_APP_CATALOG_API_URL;
  }

  /**
   * Retrieves products from the catalog based on the specified category and product IDs.
   * If no category is provided, all products will be fetched.
   * If product IDs are provided, only the specified products will be fetched.
   * @param category The category of the products to fetch.
   * @param ids The IDs of the products to fetch.
   * @returns A promise that resolves to an array of ProductItem objects.
   * @throws An error if the request fails or if the response is not successful.
   */
  public async getProductsAsync({
    category,
    ids,
  }: {
    category?: string | null;
    ids?: string[];
  }): Promise<ProductItem[]> {
    console.log(
      `Fetching products from ${`${this.catalogApiUrl}/products?categoryId=${category}`}`,
    );

    const response = !ids?.length
      ? await fetch(
          `${this.catalogApiUrl}/products?categoryId=${category ? category : ''}`,
          {
            method: 'GET',
          },
        )
      : await fetch(`${this.catalogApiUrl}/products/search}`, {
          method: 'POST',
          body: JSON.stringify({ ids }),
        });

    if (!response.ok) {
      console.error({ status: response.status, statusText: response.statusText });
      throw new Error('Unable to get products!');
    }

    return await response.json();
  }

  /**
   * Retrieves the list of product categories from the catalog API.
   * @returns A promise that resolves to an array of ProductCategory objects.
   * @throws An error if the request fails or if the response is not successful.
   */
  public async getCategoriesAsync(): Promise<ProductCategory[]> {
    console.log(`Fetching categories from ${`${this.catalogApiUrl}/productCategories`}`);

    const response = await fetch(`${this.catalogApiUrl}/productCategories`, {
      method: 'GET',
    });

    if (!response.ok) {
      console.error({ status: response.status, statusText: response.statusText });
      throw new Error('Unable to get product categories!');
    }

    return await response.json();
  }
}
