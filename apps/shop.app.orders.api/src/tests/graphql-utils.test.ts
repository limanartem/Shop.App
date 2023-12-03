import { isFieldRequested } from '../express/graphql/utils';
import * as queryWithProduct from './test-data/graphql-resolve-info/query-orders-items-product.json';
import * as queryWithoutProduct from './test-data/graphql-resolve-info/query-orders-items.json';

describe('Resolver Functions', () => {
  test('Check if field "items.product" is requested', () => {
    expect(isFieldRequested('items.product', queryWithProduct as any)).toBe(true);
  });

  test('Check if field "items.product" is requested', () => {
    expect(isFieldRequested('items.product', queryWithoutProduct as any)).toBe(false);
  });

  test('Check if field "nonexistentField" is requested', () => {
    expect(isFieldRequested('nonexistentField', queryWithProduct as any)).toBe(false);
  });
});
