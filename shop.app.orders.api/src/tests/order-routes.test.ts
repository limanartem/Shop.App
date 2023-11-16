import { createOrder, getOrders, getProductDetails } from '../data-utils';
import request from 'supertest';
import { start } from '../express/server';
import { StatusCodes } from 'http-status-codes';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { v4 as uuidv4 } from 'uuid';
import { SessionRequest, middleware, errorHandler } from 'supertokens-node/framework/express';
import { NextFunction } from 'express';
import { CreateOrderRequest, Order, ProductItem } from '../model';
import { sendMessage } from '../amqp-utils';
import { ObjectId } from 'mongodb';

jest.mock('../data-utils', () => ({
  createOrder: jest.fn(),
  getOrders: jest.fn(),
  getProductDetails: jest.fn(),
}));

jest.mock('../auth');
jest.mock('supertokens-node/framework/express', () => {
  const { errorHandler } = jest.requireActual('supertokens-node/framework/express');
  return {
    errorHandler: jest.fn(),
    middleware: jest.fn(),
  };
});
jest.mock('supertokens-node/recipe/session/framework/express');
jest.mock('../amqp-utils');

const mockSession = (expectedUserId: string) => {
  (middleware as jest.Mock).mockImplementation(() => {
    return (req: SessionRequest, _: any, next: NextFunction) => {
      req.session = {
        getUserId: () => expectedUserId,
      } as any;

      return next();
    };
  });
};

describe('order routes', () => {
  let verifySessionCalled = false;

  beforeEach(() => {
    verifySessionCalled = false;
    jest.resetAllMocks();
    (verifySession as jest.Mock).mockImplementation(() => {
      return (req: SessionRequest, _: any, next: NextFunction) => {
        verifySessionCalled = true;

        return next();
      };
    });
    (errorHandler as jest.Mock).mockImplementation(() => {
      return (err: any, _: any, __: any, next: any) => {
        return next(err);
      };
    });
  });

  describe('post /orders', () => {
    const expectedUserId = uuidv4();
    const expectedOrderId = uuidv4();

    beforeEach(() => {
      (createOrder as jest.Mock).mockImplementation(() => ({
        id: expectedOrderId,
      }));
      mockSession(expectedUserId);
    });

    afterEach(() => {
      expect(verifySessionCalled).toBeTruthy();
    });

    describe('with valid payload', () => {
      it('creates order', async () => {
        const orderPayload: CreateOrderRequest = {
          items: [
            { productId: '12345', quantity: 2 },
            { productId: '67890', quantity: 1 },
          ],
          shipping: {
            address: '123 Shipping St',
            country: 'Country',
            zip: '12345',
            city: 'City',
          },
          payment: {
            bank: {
              iban: 'DE89370400440532013000',
            },
          },
        };
        await request(start())
          .post('/orders')
          .send(orderPayload)
          .expect(StatusCodes.CREATED)
          .then((response) => {
            expect(response.body).toMatchObject({
              id: expectedOrderId,
            });
          });
        expect(createOrder).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: expectedUserId,
            status: 'pending',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            shipping: expect.objectContaining({ ...orderPayload.shipping }),
            payment: expect.objectContaining({ ...orderPayload.payment }),
            items: expect.arrayContaining([
              expect.objectContaining({
                status: 'pending',
              }),
            ]),
          }),
        );
        expect(sendMessage).toHaveBeenCalledWith(
          'pending',
          expect.objectContaining({
            data: {
              orderId: expectedOrderId,
            },
          }),
        );
      });

      it('sanitizes payload', async () => {
        await request(start())
          .post('/orders')
          .send({
            items: [
              { productId: '12345', quantity: 2, price: 200.23 }, // Price is not part of the model
            ],
            shipping: {
              address: '123 Shipping St',
              country: 'Country',
              zip: '12345',
              city: 'City',
              line1: 'Street 123', // not part of the model
            },
            shoppingCart: [{ id: '2344' }], //  not part of the model
            payment: {
              bank: {
                iban: 'DE89370400440532013000',
              },
            },
          } as any)
          .expect(StatusCodes.CREATED)
          .then((response) => {
            expect(response.body).toMatchObject({
              id: expectedOrderId,
            });
          });
        expect(createOrder).toHaveBeenCalledWith(
          expectedUserId,
          expect.objectContaining({
            items: expect.arrayContaining([
              {
                productId: expect.any(String),
                quantity: expect.any(Number),
              },
            ]),
            shipping: expect.objectContaining({
              address: expect.any(String),
              country: expect.any(String),
              zip: expect.any(String),
              city: expect.any(String),
            }),
            payment: expect.objectContaining({
              bank: expect.objectContaining({
                iban: expect.any(String),
              }),
            }),
          }),
        );
      });
    });

    describe('with invalid payload', () => {
      afterEach(() => {
        expect(createOrder).not.toHaveBeenCalled();
        expect(sendMessage).not.toHaveBeenCalled();
      });

      it('fails when shipping is missing', async () => {
        const orderPayload: CreateOrderRequest = {
          items: [{ productId: '12345', quantity: 2 }],
          payment: {
            bank: {
              iban: 'DE89370400440532013000',
            },
          },
        } as any;
        await request(start()).post('/orders').send(orderPayload).expect(StatusCodes.BAD_REQUEST);
      });

      it('fails when payment is missing', async () => {
        const orderPayload: CreateOrderRequest = {
          items: [
            { productId: '12345', quantity: 2 },
            { productId: '67890', quantity: 1 },
          ],
          shipping: {
            address: '123 Shipping St',
            country: 'Country',
            zip: '12345',
            city: 'City',
          },
        } as any;
        await request(start()).post('/orders').send(orderPayload).expect(StatusCodes.BAD_REQUEST);
      });

      it('fails when payment type is missing', async () => {
        const orderPayload: CreateOrderRequest = {
          items: [
            { productId: '12345', quantity: 2 },
            { productId: '67890', quantity: 1 },
          ],
          shipping: {
            address: '123 Shipping St',
            country: 'Country',
            zip: '12345',
            city: 'City',
          },
          payment: {},
        };
        await request(start()).post('/orders').send(orderPayload).expect(StatusCodes.BAD_REQUEST);
      });
    });
  });

  describe('get /orders', () => {
    afterEach(() => {
      expect(verifySessionCalled).toBeTruthy();
    });

    it('returns orders for user', async () => {
      const expectedUserId = uuidv4();
      const expectedOrderId = ObjectId.createFromTime(Date.now());

      mockSession(expectedUserId);
      (getOrders as jest.Mock).mockImplementation(() => [
        {
          _id: expectedOrderId.toHexString(),
          id: expectedOrderId.toHexString(),
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
              },
            ],
          });
        });

      expect(getOrders).toHaveBeenCalledWith(expectedUserId);
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
      (getOrders as jest.Mock).mockImplementation(() => [
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

      expect(getOrders).toHaveBeenCalledWith(expectedUserId);
      expect(getProductDetails).toHaveBeenCalledWith(expectedProducts.map((p) => p.id));
    });
  });
});
