import env from '../config/environment';
import {
  AuthServiceClient,
  CatalogServiceClient,
  OrderServiceClient,
} from '@shop.app/lib.client-data/dist/services';
import { getAccessToken } from '../utils/supertoken-utils';

export const catalogServiceClient = new CatalogServiceClient(env);
export const authServiceClient = new AuthServiceClient(env, getAccessToken);
export const orderServiceClient = new OrderServiceClient(env, getAccessToken);
