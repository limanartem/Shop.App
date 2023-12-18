import { env } from '../config/environment';

import {
  AuthServiceClient,
  CatalogServiceClient,
  GraphQlWsClient,
  OrderServiceClient,
} from '@shop.app/lib.client-data/dist/services';

export const catalogServiceClient = new CatalogServiceClient(env);
export const graphQlWsClient = new GraphQlWsClient(env);
export const orderServiceClient = new OrderServiceClient(env);
export const authServiceClient = new AuthServiceClient(env);
