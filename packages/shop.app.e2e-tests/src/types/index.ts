/**
 * Common types for e2e tests
 */

/**
 * Product interface matching the admin app's product model
 */
export interface Product {
  readonly id?: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly available: boolean;
  readonly categoryId?: number;
  readonly imageUrls?: readonly string[];
}

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

/**
 * Test configuration interface
 */
export interface TestConfig {
  readonly adminUrl: string;
  readonly adminCredentials: LoginCredentials;
  readonly testProduct: Product;
}
