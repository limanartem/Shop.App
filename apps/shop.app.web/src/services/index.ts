import { env } from '../config/environment';
import Session from 'supertokens-auth-react/recipe/session';

import {
  AuthServiceClient,
  CatalogServiceClient,
  GraphQlWsClient,
  OrderServiceClient,
} from '@shop.app/lib.client-data/dist/services';

// Cannot use Session in @shop.app/lib.client-data as it will not share same instance due to packaging, 
// hence passing token getter function Session.getAccessToken to client data services instead


export const catalogServiceClient = new CatalogServiceClient(env);
export const graphQlWsClient = new GraphQlWsClient(env, Session.getAccessToken);
export const orderServiceClient = new OrderServiceClient(env, Session.getAccessToken);
export const authServiceClient = new AuthServiceClient(env, Session.getAccessToken);
