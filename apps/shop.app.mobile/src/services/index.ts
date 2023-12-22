import env from '../config/environment';
import { AuthServiceClient, CatalogServiceClient, OrderServiceClient  } from '@shop.app/lib.client-data/dist/services';
import SuperTokens from 'supertokens-react-native';

export const catalogServiceClient = new CatalogServiceClient(env);
export const authServiceClient = new AuthServiceClient(env);
export const orderServiceClient = new OrderServiceClient(env, SuperTokens.getAccessToken);