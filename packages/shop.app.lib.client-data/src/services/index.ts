import { AuthServiceClient } from './auth';
import { CatalogServiceClient } from '@shop.app/lib.client-data.catalog-service/dist/catalog-service';
import { OrderServiceClient } from './order-service';
import { GraphQlWsClient } from './ws-service';
import { ShoppingCartService } from './shopping-cart-service';

export type GetAccessTokenFunc = () => Promise<string | undefined>;

export abstract class ServiceClient {
  protected getAccessToken: GetAccessTokenFunc;
  protected env: Record<string, string>;

  constructor(env: Record<string, string>, getAccessToken: GetAccessTokenFunc) {
    this.getAccessToken = getAccessToken;
    this.env = env;
  }
}

export { AuthServiceClient, CatalogServiceClient, OrderServiceClient, GraphQlWsClient, ShoppingCartService };
