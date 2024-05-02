import { Mutation, ShoppingCart, ShoppingCartMergeInput } from '../../generated/shopping-cart/graphql';
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
}
