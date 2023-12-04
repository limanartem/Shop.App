import { isFieldRequested } from '../express/graphql/utils';
import * as queryWithProduct from './test-data/graphql-resolve-info/query-orders-items-product.json';
import * as queryWithProductFragment from './test-data/graphql-resolve-info/query-orders-items-product-with-gragment.json';
import * as queryWithoutProduct from './test-data/graphql-resolve-info/query-orders-items.json';

describe('Resolver Functions', () => {
  test('When "items.product" is in a query, then is requested should be true', () => {
    expect(isFieldRequested('items.product', queryWithProduct as any)).toBe(true);
  });

  test('When "items.product" is in a query fragment, then is requested should be true', () => {
    expect(isFieldRequested('items.product', queryWithProductFragment as any)).toBe(true);
  });

  test('When "items.product" is not in query is requested should be false', () => {
    expect(isFieldRequested('items.product', queryWithoutProduct as any)).toBe(false);
  });
});
