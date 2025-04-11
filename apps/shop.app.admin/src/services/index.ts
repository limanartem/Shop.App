import { env } from '../config/environment';
import { OrderServiceClient } from '@shop.app/lib.client-data/dist/services';
import { getAccessToken } from '../utils/auth';

/**
 * Shared service clients for the admin application
 * Using the same client implementations as the web app for consistency
 */

// Initialize the order service client with our environment and auth token getter
export const orderServiceClient = new OrderServiceClient(env, getAccessToken);
