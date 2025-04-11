/**
 * Environment configuration for the admin application
 */

// Get environment variables from process.env with fallbacks
export const env: Record<string, string> = {
  REACT_APP_ORDERS_API_HOST: process.env.REACT_APP_ORDERS_API_URL || 'localhost:3001',
  REACT_APP_CATALOG_API_URL: process.env.REACT_APP_CATALOG_API_URL || 'http://localhost:3002',
  REACT_APP_AUTH_API_URL: process.env.REACT_APP_AUTH_API_URL || 'http://localhost:3003',
  REACT_APP_CDN_URL: process.env.REACT_APP_CDN_URL || 'http://localhost:3005',
  REACT_APP_ORDERS_API_PROVIDER: process.env.REACT_APP_ORDERS_API_PROVIDER || 'rest'
};
