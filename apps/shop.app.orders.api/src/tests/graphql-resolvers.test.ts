import { getOrdersExpanded, getOrders, getOrder, getOrderExpanded } from '../domain/orders';
import request from 'supertest';
import { start } from '../express/express-server';
import { StatusCodes } from 'http-status-codes';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { v4 as uuidv4 } from 'uuid';
import { SessionRequest, middleware } from 'supertokens-node/framework/express';
import { NextFunction } from 'express';
import { ProductItem } from '../model';
import { ObjectId } from 'mongodb';
import { mockImpl } from './utils';

jest.mock('../domain/orders', () => ({
  createOrder: jest.fn(),
  getOrdersExpanded: jest.fn(),
  getOrderExpanded: jest.fn(),
  getProductDetails: jest.fn(),
  getOrders: jest.fn(),
  getOrder: jest.fn(),
  updateOrder: jest.fn(() => Promise.resolve()),
}));

jest.mock('../utils/auth', () => ({
  verifyUserRole: jest.fn(() => () => {}),
  initAuth: jest.fn(() => () => {}),
}));

jest.mock('supertokens-node/recipe/session/framework/express', () => ({
  verifySession: jest.fn(() => () => {}),
}));

jest.mock('supertokens-node/framework/express', () => ({
  errorHandler: jest.fn(() => (err: any, __: any, ___: any, next: NextFunction) => {
    console.error(err);

    return next();
  }),
  middleware: jest.fn(() => () => {}),
}));

const mockSession = (expectedUserId: string) => {
  mockImpl(middleware, () => {
    return (req: SessionRequest, _: any, next: NextFunction) => {
      req.session = {
        getUserId: () => expectedUserId,
        getTenantId: () => 'tenant1',
      } as any;

      return next();
    };
  });
};

describe('orders graphql', () => {
  let verifySessionCalled = false;
  const expectedUserId = uuidv4();
  const expectedOrderId = ObjectId.createFromTime(Date.now());
  const expectedProducts: ProductItem[] = [uuidv4(), uuidv4()].map((id, index) => ({
    id,
    title: `Title ${index + 1}`,
    description: `Description ${index + 1}`,
    price: Math.random() * 1000,
    currency: 'USD',
    category: '1',
  }));

  beforeEach(() => {
    verifySessionCalled = false;

    jest.clearAllMocks();
    mockImpl(verifySession, () => {
      return (req: SessionRequest, _: any, next: NextFunction) => {
        verifySessionCalled = true;

        return next();
      };
    });

    mockSession(expectedUserId);
  });

  afterEach(() => {
    expect(verifySessionCalled).toBeTruthy();
  });

  describe('query orders', () => {
    beforeEach(() => {
      mockImpl(getOrders, () => [
        {
          _id: expectedOrderId.toHexString(),
          id: expectedOrderId.toHexString(),
          status: 'new',
        },
      ]);

      mockImpl(getOrdersExpanded, () => [
        {
          _id: expectedOrderId.toHexString(),
          id: expectedOrderId.toHexString(),
          status: 'new',
          items: expectedProducts.map((p, index) => ({
            product: p,
            productId: p.id,
            quantity: index + 1,
          })),
        },
      ]);
    });

    it('returns orders for user', async () => {
      await request(start())
        .post('/graphql')
        .send({ query: '{ orders { id }}' })
        .expect(StatusCodes.OK)
        .then((res) => {
          const { errors } = res.body;
          expect(errors).toBeUndefined();
        });

      expect(getOrders).toHaveBeenCalledWith(expectedUserId);
      expect(getOrdersExpanded).not.toHaveBeenCalled();
    });

    it('if item product info is requested then fetches expanded order', async () => {
      await request(start())
        .post('/graphql')
        .send({ query: '{ orders { id, items { productId, quantity, product { title }} }}' })
        .expect(StatusCodes.OK)
        .then((res) => {
          const { errors } = res.body;
          expect(errors).toBeUndefined();

          expect(res.body).toMatchObject({
            data: {
              orders: [
                {
                  id: expectedOrderId.toHexString(),
                  items: expectedProducts.map((p, index) => ({
                    product: { title: p.title },
                    productId: p.id,
                    quantity: index + 1,
                  })),
                },
              ],
            },
          });
        });

      expect(getOrdersExpanded).toHaveBeenCalledWith(expectedUserId);
      expect(getOrders).not.toHaveBeenCalled();
    });

    it('if item product info is requested in fragments then fetches expanded order', async () => {
      await request(start())
        .post('/graphql')
        .send({
          query: `
        query { orders { ...orderFields } },      
        fragment orderFields on Order {
          id
          items {
            productId
            quantity
            product {
              title
            }
          }
        }
        `,
        })
        .expect(StatusCodes.OK)
        .then((res) => {
          const { errors } = res.body;
          expect(errors).toBeUndefined();

          expect(res.body).toMatchObject({
            data: {
              orders: [
                {
                  id: expectedOrderId.toHexString(),
                  items: expectedProducts.map((p, index) => ({
                    product: { title: p.title },
                    productId: p.id,
                    quantity: index + 1,
                  })),
                },
              ],
            },
          });
        });

      expect(getOrdersExpanded).toHaveBeenCalledWith(expectedUserId);
      expect(getOrders).not.toHaveBeenCalled();
    });
  });

  describe('query order by id', () => {
    beforeEach(() => {
      mockImpl(getOrder, () => ({
        _id: expectedOrderId.toHexString(),
        id: expectedOrderId.toHexString(),
        status: 'new',
      }));

      mockImpl(getOrderExpanded, () => ({
        _id: expectedOrderId.toHexString(),
        id: expectedOrderId.toHexString(),
        status: 'new',
        items: expectedProducts.map((p, index) => ({
          product: p,
          productId: p.id,
          quantity: index + 1,
        })),
      }));
    });

    it('fetches order details', async () => {
      await request(start())
        .post('/graphql')
        .send({
          query: `
            query getOrder($id: ObjectID!) {
               order(id: $id) {
                 id, status
               }
            }`,
          variables: { id: expectedOrderId },
        })
        .expect(StatusCodes.OK)
        .then((res) => {
          const { errors } = res.body;
          expect(errors).toBeUndefined();
          expect(res.body).toMatchObject({
            data: {
              order: {
                id: expectedOrderId.toHexString(),
                status: 'new',
              },
            },
          });
        });

      expect(getOrder).toHaveBeenCalledWith(expectedOrderId.toHexString(), expectedUserId);
      expect(getOrderExpanded).not.toHaveBeenCalled();
    });

    it('fetches extended order details', async () => {
      await request(start())
        .post('/graphql')
        .send({
          query: `
            query getOrder($id: ObjectID!) {
               order(id: $id) {
                 id, status,
                 items {
                  productId
                  quantity
                  product {
                    title
                  }
                }
               }
            }`,
          variables: { id: expectedOrderId },
        })
        .expect(StatusCodes.OK)
        .then((res) => {
          const { errors } = res.body;
          expect(errors).toBeUndefined();
          expect(res.body).toMatchObject({
            data: {
              order: {
                id: expectedOrderId.toHexString(),
                status: 'new',
                items: expectedProducts.map((p, index) => ({
                  product: { title: p.title },
                  productId: p.id,
                  quantity: index + 1,
                })),
              },
            },
          });
        });

      expect(getOrderExpanded).toHaveBeenCalledWith(expectedOrderId.toHexString(), expectedUserId);
      expect(getOrder).not.toHaveBeenCalled();
    });
  });
});
