import env from '../config/environment';
import { CatalogServiceClient  } from '@shop.app/lib.client-data/dist/services';

export const catalogServiceClient = new CatalogServiceClient(env);
