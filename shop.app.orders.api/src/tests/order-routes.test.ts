import { createOrder, getOrdersExpanded, getProductDetails, updateOrder } from '../data-utils';
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
import { verifyUserRole } from '../auth';
import { OrderFlow, OrderStatuses, Status } from '../model/orders-model';

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

describe('order routes', () => {
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

  describe('post /orders', () => {
    const expectedOrderId = uuidv4();

    beforeEach(() => {
      (createOrder as jest.Mock).mockImplementation(() => ({
        id: expectedOrderId,
      }));
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
          expect.objectContaining({
            items: expect.arrayContaining([
              {
                productId: expect.any(String),
                quantity: expect.any(Number),
                status: 'pending',
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
      (getOrdersExpanded as jest.Mock).mockImplementation(() => [
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

  describe('put /order/:id', () => {
    let verifyUserRoleCalled = false;
    const expectedOrderId = uuidv4();

    beforeEach(() => {
      (verifyUserRole as jest.Mock).mockImplementation(() => {
        return (req: SessionRequest, _: any, next: NextFunction) => {
          verifyUserRoleCalled = true;
          return next();
        };
      });

      mockSession(expectedUserId);
    });

    afterEach(() => {
      expect(verifySessionCalled).toBeTruthy();
      expect(verifyUserRoleCalled).toBeTruthy();
    });

    describe('validates payload', () => {
      it('missing body', async () => {
        await request(start()).put(`/order/${expectedOrderId}`).expect(StatusCodes.BAD_REQUEST);
      });

      it('missing order data to update', async () => {
        await request(start())
          .put(`/order/${expectedOrderId}`)
          .send({})
          .expect(StatusCodes.BAD_REQUEST);
      });
    });

    describe('for valid payload', () => {
      it('updates existing order status', async () => {
        const expectedOrderId = uuidv4();
        const expectedStatus = OrderStatuses[1];

        await request(start())
          .put(`/order/${expectedOrderId}`)
          .send({ status: expectedStatus })
          .expect(StatusCodes.OK);

        expect(updateOrder).toHaveBeenCalledWith(expectedOrderId, {
          status: expectedStatus,
          updatedAt: expect.any(Date),
          updatedBy: expect.any(String),
        });
      });

      it.each([
        ['confirmed', 'payment'],
        ['paid', 'dispatch'],
      ])(
        'when setting order status to "%s" starts "%s" order workflow',
        async (status: Status, flow: OrderFlow) => {
          const expectedOrderId = uuidv4();

          await request(start())
            .put(`/order/${expectedOrderId}`)
            .send({ status })
            .expect(StatusCodes.OK);

          expect(sendMessage).toHaveBeenCalledWith(
            flow,
            expect.objectContaining({
              data: {
                orderId: expectedOrderId,
              },
            }),
          );
        },
      );
    });
  });
});
