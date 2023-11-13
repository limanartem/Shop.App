import { createOrder } from '../data-utils';
import request from 'supertest';
import { start } from '../express/server';
import { StatusCodes } from 'http-status-codes';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { v4 as uuidv4 } from 'uuid';
import { SessionRequest, middleware } from 'supertokens-node/framework/express';
import { NextFunction } from 'express';
import { OrderRequestPayload } from '../model';

jest.mock('../data-utils', () => ({
  createOrder: jest.fn(() => Promise.resolve()),
}));

jest.mock('../auth');
jest.mock('supertokens-node/framework/express', () => {
  return {
    errorHandler: jest.fn(() => () => Promise.resolve()),
    middleware: jest.fn(),
  };
});
jest.mock('supertokens-node/recipe/session/framework/express');

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

describe('express-server', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    (verifySession as jest.Mock).mockImplementation(() => {
      return (req: SessionRequest, _: any, next: NextFunction) => {
        return next();
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
      expect(verifySession).toHaveBeenCalled();
    });

    describe('with valid payload', () => {
      it('creates order', async () => {
        await request(start())
          .post('/orders')
          .send({})
          .expect(StatusCodes.CREATED)
          .then((response) => {
            expect(response.body).toMatchObject({
              id: expectedOrderId,
            });
          });
        expect(createOrder).toHaveBeenCalledWith(expectedUserId, expect.objectContaining({}));
      });

      it('sanitizes payload', async () => {
        await request(start())
          .post('/orders')
          .send({
            items: [{
              productId: uuidv4(),
              quantity:1,
              price: 100, // price is not part of the data model
            } as any],
          } as OrderRequestPayload)
          .expect(StatusCodes.CREATED)
          .then((response) => {
            expect(response.body).toMatchObject({
              id: expectedOrderId,
            });
          });
        expect(createOrder).toHaveBeenCalledWith(expectedUserId, expect.objectContaining({
          items: expect.arrayContaining([{
            productId: expect.any(String),
            quantity: expect.any(Number),
          }])
        }));
      });
    });
  });
});
