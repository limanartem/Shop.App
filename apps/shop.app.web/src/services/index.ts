import { env } from '../config/environment';
import Session from 'supertokens-auth-react/recipe/session';

import {
  AuthServiceClient,
  CatalogServiceClient,
  GraphQlWsClient,
  OrderServiceClient,
} from '@shop.app/lib.client-data/dist/services';

export const catalogServiceClient = new CatalogServiceClient(env);
export const graphQlWsClient = new GraphQlWsClient(env, Session.getAccessToken);
export const orderServiceClient = new OrderServiceClient(env, Session.getAccessToken);
export const authServiceClient = new AuthServiceClient(env);
