import env from '../config/environment';
import { AuthServiceClient, CatalogServiceClient  } from '@shop.app/lib.client-data/dist/services';

export const catalogServiceClient = new CatalogServiceClient(env);
export const authServiceClient = new AuthServiceClient(env);