import { getOrdersExpanded, getProductDetails } from '../data-utils';
import request from 'supertest';
import { start } from '../express/server';
import { StatusCodes } from 'http-status-codes';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { v4 as uuidv4 } from 'uuid';
import { SessionRequest, middleware } from 'supertokens-node/framework/express';
import { NextFunction } from 'express';
import { ProductItem } from '../model';
import { ObjectId } from 'mongodb';

jest.mock('../data-utils', () => ({
  createOrder: jest.fn(),
  getOrdersExpanded: jest.fn(),
  getProductDetails: jest.fn(),
  updateOrder: jest.fn(() => Promise.resolve()),
}));

jest.mock('../auth', () => ({
  verifyUserRole: jest.fn(() => () => {}),
  initAuth: jest.fn(() => () => {}),
}));
jest.mock('supertokens-node/framework/express', () => {
  // const { errorHandler } = jest.requireActual('supertokens-node/framework/express');
  return {
    errorHandler: jest.fn(() => () => {}),
    middleware: jest.fn(() => () => {}),
  };
});
jest.mock('supertokens-node/recipe/session/framework/express', () => ({
  verifySession: jest.fn(() => () => {}),
}));
jest.mock('../amqp-utils');

const mockSession = (expectedUserId: string) => {
  (middleware as jest.Mock).mockImplementation(() => {
    return (req: SessionRequest, _: any, next: NextFunction) => {
      req.session = {
        getUserId: () => expectedUserId,
        getTenantId: () => 'tenant1',
      } as any;

      return next();
    };
  });
};

xdescribe('orders graphql', () => {
  let verifySessionCalled = false;
  const expectedUserId = uuidv4();

  beforeEach(() => {
    verifySessionCalled = false;

    jest.clearAllMocks();
    (verifySession as jest.Mock).mockImplementation(() => {
      return (req: SessionRequest, _: any, next: NextFunction) => {
        verifySessionCalled = true;

        return next();
      };
    });

    mockSession(expectedUserId);
  });

  describe('query orders', () => {
    afterEach(() => {
      expect(verifySessionCalled).toBeTruthy();
    });

    it('returns orders for user', async () => {
      const expectedUserId = uuidv4();
      const expectedOrderId = ObjectId.createFromTime(Date.now());

      mockSession(expectedUserId);
      (getOrdersExpanded as jest.Mock).mockImplementation(() => [
        {
          _id: expectedOrderId.toHexString(),
          id: expectedOrderId.toHexString(),
        },
      ]);

      await request(start())
        .post('/graphql')
        .send({query: '{ orders: { id }}'})
        .expect(StatusCodes.OK)
        ;

      expect(getOrdersExpanded).toHaveBeenCalledWith(expectedUserId);
    });

    it('enriches ordered items with product details', async () => {
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

      (getProductDetails as jest.Mock).mockImplementation(() => Promise.resolve(expectedProducts));
      mockSession(expectedUserId);
      (getOrdersExpanded as jest.Mock).mockImplementation(() => [
        {
          _id: expectedOrderId.toHexString(),
          id: expectedOrderId.toHexString(),
          items: expectedProducts.map((p, index) => ({
            productId: p.id,
            quantity: index + 1,
          })),
        },
      ]);

      await request(start())
        .get('/orders')
        .expect(StatusCodes.OK)
        .then((response) => {
          expect(response.body).toMatchObject({
            orders: [
              {
                id: expectedOrderId.toHexString(),
                items: expectedProducts.map((p, index) => ({
                  product: p,
                  productId: p.id,
                  quantity: index + 1,
                })),
              },
            ],
          });
        });

      expect(getOrdersExpanded).toHaveBeenCalledWith(expectedUserId);
      expect(getProductDetails).toHaveBeenCalledWith(expectedProducts.map((p) => p.id));
    });

    it('skip products details if fetching product details fails', async () => {
      const expectedUserId = uuidv4();
      const expectedOrderId = ObjectId.createFromTime(Date.now());
      const expectedProducts: string[] = [uuidv4(), uuidv4()];

      (getProductDetails as jest.Mock).mockImplementation(() =>
        Promise.reject('Error fetching products'),
      );
      mockSession(expectedUserId);
      (getOrdersExpanded as jest.Mock).mockImplementation(() => [
        {
          _id: expectedOrderId.toHexString(),
          id: expectedOrderId.toHexString(),
          items: expectedProducts.map((id, index) => ({
            productId: id,
            quantity: index + 1,
          })),
        },
      ]);

      await request(start())
        .get('/orders')
        .expect(StatusCodes.OK)
        .then((response) => {
          expect(response.body).toMatchObject({
            orders: [
              {
                id: expectedOrderId.toHexString(),
                items: expectedProducts.map((id, index) => ({
                  productId: id,
                  quantity: index + 1,
                })),
              },
            ],
          });
        });

      expect(getOrdersExpanded).toHaveBeenCalledWith(expectedUserId);
      expect(getProductDetails).toHaveBeenCalledWith(expectedProducts.map((id) => id));
    });
  });
});
