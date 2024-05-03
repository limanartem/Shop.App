import {
  Mutation,
  ShoppingCart,
  ShoppingCartItemInput,
  ShoppingCartMergeInput,
} from '../../generated/shopping-cart/graphql';
import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client';
import { GetAccessTokenFunc } from '..';
import { setContext } from '@apollo/client/link/context';
import fetch from 'cross-fetch';

const MERGE = gql(`mutation mergeShoppingCart($input: ShoppingCartMergeInput!) {
  merge(input: $input) {
    items {
      productId
      quantity
      product {
        id
        title
        description
        price
        currency
      }
    }
  }
}`);

const ADD_TO_CART = gql(`mutation addToShoppingCart($item: ShoppingCartItemInput!) {
  addToCart(item: $item) {
    items {
      productId
      quantity
      product {
        id
        title
        description
        price
        currency
      }
    }
  }
}`);

const REMOTE_FROM_CART = gql(`mutation removeFromShoppingCart($productId: String!) {
  removeFromCart(productId: $productId) {
    items {
      productId
      quantity
      product {
        id
        title
        description
        price
        currency
      }
    }
  }
}`);

const DELETE_CART = gql(`mutation deleteShoppingCart {
  deleteCart {
    deleted
  }
}`);

export class ShoppingCartService {
  private client: ApolloClient<any>;

  constructor(env: Record<string, string>, getAccessToken: GetAccessTokenFunc) {
    const { REACT_APP_SHOPPING_CART_API_URL } = env;

    const authLink = setContext(async (_, { headers }) => {
      const token = await getAccessToken();
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : '',
        },
      };
    });

    this.client = new ApolloClient({
      link: authLink.concat(createHttpLink({ uri: REACT_APP_SHOPPING_CART_API_URL, fetch })),
      cache: new InMemoryCache(),
    });
  }

  public async merge(input: ShoppingCartMergeInput): Promise<ShoppingCart | undefined | null> {
    const result = await this.client.mutate<Mutation>({
      mutation: MERGE,
      variables: { input },
    });

    return result.data?.merge;
  }

  public async addToCart(input: ShoppingCartItemInput): Promise<ShoppingCart | undefined | null> {
    const result = await this.client.mutate<Mutation>({
      mutation: ADD_TO_CART,
      variables: { item: input },
    });

    return result.data?.addToCart;
  }

  public async removeFromCart(productId: string): Promise<ShoppingCart | undefined | null> {
    const result = await this.client.mutate<Mutation>({
      mutation: REMOTE_FROM_CART,
      variables: { productId },
    });

    return result.data?.removeFromCart;
  }

  public async deleteCart(): Promise<void> {
    await this.client.mutate<Mutation>({
      mutation: DELETE_CART,
    });
  }
}
