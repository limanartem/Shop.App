import { TestConfig } from '../types';
import { getEnv } from './helpers';

/**
 * Test configuration with environment variables
 */
export const testConfig: TestConfig = {
  adminUrl: getEnv('ADMIN_APP_URL', 'http://localhost:3006'),
  adminCredentials: {
    email: getEnv('ADMIN_USER_EMAIL', 'admin@shop.app'),
    password: getEnv('ADMIN_USER_PASSWORD', 'admin123')
  },
  testProduct: {
    name: getEnv('TEST_PRODUCT_NAME', 'Test Product E2E'),
    description: getEnv('TEST_PRODUCT_DESCRIPTION', 'This is a test product created by E2E tests'),
    price: parseFloat(getEnv('TEST_PRODUCT_PRICE', '99.99')),
    available: true
  }
};
