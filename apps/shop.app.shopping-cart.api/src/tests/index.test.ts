import request from 'supertest';
import createApolloServer from '../apollo-server';
import { ApolloServer } from '@apollo/server';
import { StatusCodes } from 'http-status-codes';
import { decodeToken } from '@shop.app/lib.server-utils/dist/auth';
import { randomUUID } from 'crypto';
import {
  WithClearId,
  fetchDocument,
  fetchDocuments,
  insertDocument,
  updateDocument,
} from '@shop.app/lib.server-utils/dist/mongodb';
import { RequestContext } from '../types';

jest.mock('@shop.app/lib.server-utils/dist/auth', () => ({
  decodeToken: jest.fn(),
}));

jest.mock('@shop.app/lib.server-utils/dist/mongodb', () => ({
  fetchDocument: jest.fn(),
  fetchDocuments: jest.fn(),
  insertDocument: jest.fn(),
  updateDocument: jest.fn(),
}));

describe('shopping-cart api', () => {
  let server: ApolloServer<RequestContext>, url: string;

  beforeEach(async () => {
    jest.resetAllMocks();
  });

  beforeAll(async () => {
    ({ server, url } = await createApolloServer());
  });

  afterAll(async () => {
    await server?.stop();
  });

  describe('should authenticate request', () => {
    it(`should return ${StatusCodes.UNAUTHORIZED} if auth header is missing`, async () => {
      await request(url)
        .post('.')
        .send({ query: 'query {shoppingCart { userId} }' })
        .expect(StatusCodes.UNAUTHORIZED);
    });

    it(`should return ${StatusCodes.UNAUTHORIZED} if token failed to decode`, async () => {
      (decodeToken as jest.Mock).mockResolvedValue(null);
      const token = btoa(randomUUID());
      await request(url)
        .post('.')
        .set('Authorization', `Bearer ${token}`)
        .send({ query: 'query {shoppingCart { userId} }' })
        .expect(StatusCodes.UNAUTHORIZED);

      expect(decodeToken).toHaveBeenCalledWith(token);
    });

    it(`should return ${StatusCodes.OK} if token successfully decoded`, async () => {
      const token = btoa(randomUUID());
      const userId = randomUUID();

      (decodeToken as jest.Mock).mockResolvedValue({
        sub: userId,
      });

      await request(url)
        .post('.')
        .set('Authorization', `Bearer ${token}`)
        .send({ query: 'query {shoppingCart { userId} }' })
        .expect(StatusCodes.OK);

      expect(decodeToken).toHaveBeenCalledWith(token);
    });
  });

  describe('for authenticated requests', () => {
    const token = btoa(randomUUID());
    const userId = randomUUID();
    const req = () => request(url).post('.').set('Authorization', `Bearer ${token}`);

    beforeEach(() => {
      (decodeToken as jest.Mock).mockResolvedValue({
        sub: userId,
      });
    });

    afterEach(() => {
      expect(decodeToken).toHaveBeenCalledWith(token);
    });

    describe('should return shopping cart', () => {
      it('should return shopping cart', async () => {
        (fetchDocument as jest.Mock).mockResolvedValue({
          userId,
          items: [
            {
              productId: '123',
              quantity: 1,
              product: {
                id: '123',
                title: 'Test',
                description: 'Test',
                price: 1,
                currency: 'USD',
              },
            },
          ],
        });

        const response = await req()
          .send({ query: 'query {shoppingCart { userId} }' })
          .expect(StatusCodes.OK);

        expect(response.body.data?.shoppingCart).toBeDefined();
        expect(response.body.data.shoppingCart.userId).toEqual(userId);
        expect(fetchDocument).toHaveBeenCalledWith(
          {
            userId,
          },
          'shopping-cart',
        );
      });

      it('if shopping cart does not exist should return null', async () => {
        (fetchDocument as jest.Mock).mockResolvedValue(null);

        const response = await req()
          .send({ query: 'query {shoppingCart { userId} }' })
          .expect(StatusCodes.OK);

        expect(response.body.data?.shoppingCart).toBeNull();
        expect(fetchDocument).toHaveBeenCalledWith({ userId }, 'shopping-cart');
      });
    });

    describe('add product to shopping cart', () => {
      it('should add product to new shopping cart', async () => {
        const productId = randomUUID();
        const quantity = 2;
        const expectedShoppingCart = {
          userId,
          items: [
            {
              productId,
              quantity,
            },
          ],
        };

        (fetchDocument as jest.Mock).mockResolvedValue(null);
        (insertDocument as jest.Mock).mockResolvedValue(expectedShoppingCart);

        const response = await req()
          .send({
            query: `mutation {addToCart(item: {productId: "${productId}", quantity: ${quantity}}) { userId} }`,
          })
          .expect(StatusCodes.OK);

        expect(response.body.data?.addToCart).toBeDefined();
        expect(response.body.data.addToCart.userId).toEqual(userId);
        expect(insertDocument).toHaveBeenCalledWith(expectedShoppingCart, 'shopping-cart');
      });

      it('should add product to existing shopping cart with no items', async () => {
        const productId = randomUUID();
        const quantity = 2;
        const cartId = randomUUID();

        const existingShoppingCart = {
          id: cartId,
          userId,
          items: null,
        };

        const expectedShoppingCart = {
          id: cartId,
          userId,
          items: [
            {
              productId,
              quantity,
            },
          ],
        };

        (fetchDocument as jest.Mock).mockResolvedValue(existingShoppingCart);
        (updateDocument as jest.Mock).mockResolvedValue(expectedShoppingCart);

        const response = await req()
          .send({
            query: `mutation {addToCart(item: {productId: "${productId}", quantity: ${quantity}}) { userId} }`,
          })
          .expect(StatusCodes.OK);

        expect(response.body.data?.addToCart).toBeDefined();
        expect(response.body.data.addToCart.userId).toEqual(userId);
        expect(updateDocument).toHaveBeenCalledWith(cartId, expectedShoppingCart, 'shopping-cart');
      });

      it('should add product to existing shopping cart', async () => {
        const productId = randomUUID();
        const quantity = 2;
        const cartId = randomUUID();

        const existingShoppingCart = {
          id: cartId,
          userId,
          items: [
            {
              productId,
              quantity,
            },
          ],
        };

        const expectedShoppingCart = {
          id: cartId,
          userId,
          items: [
            {
              productId,
              quantity: quantity * 2,
            },
          ],
        };

        (fetchDocument as jest.Mock).mockResolvedValue(existingShoppingCart);
        (updateDocument as jest.Mock).mockResolvedValue(expectedShoppingCart);

        const response = await req()
          .send({
            query: `mutation {addToCart(item: {productId: "${productId}", quantity: ${quantity}}) { userId} }`,
          })
          .expect(StatusCodes.OK);

        expect(response.body.data?.addToCart).toBeDefined();
        expect(response.body.data.addToCart.userId).toEqual(userId);
        expect(updateDocument).toHaveBeenCalledWith(cartId, expectedShoppingCart, 'shopping-cart');
      });
    });

    describe('remove product from shopping cart', () => {
      it('should remove product from shopping cart', async () => {
        const productIds = [randomUUID(), randomUUID()];
        const cartId = randomUUID();

        const existingShoppingCart = {
          id: cartId,
          userId,
          items: productIds.map((productId, index) => ({
            productId,
            quantity: index + 1,
          })),
        };

        const expectedShoppingCart = {
          id: cartId,
          userId,
          items: [
            {
              productId: productIds[1],
              quantity: 2,
            },
          ],
        };

        (fetchDocument as jest.Mock).mockResolvedValue(existingShoppingCart);
        (updateDocument as jest.Mock).mockResolvedValue(expectedShoppingCart);

        const response = await req()
          .send({
            query: `mutation {removeFromCart(productId: "${productIds[0]}") { userId} }`,
          })
          .expect(StatusCodes.OK);

        expect(response.body.data?.removeFromCart).toBeDefined();
        expect(response.body.data.removeFromCart.userId).toEqual(userId);
        expect(updateDocument).toHaveBeenCalledWith(cartId, expectedShoppingCart, 'shopping-cart');
      });

      it('should not update shopping cart if item does not exist', async () => {
        const productIds = [randomUUID(), randomUUID()];
        const cartId = randomUUID();

        const existingShoppingCart = {
          id: cartId,
          userId,
          items: productIds.map((productId, index) => ({
            productId,
            quantity: index + 1,
          })),
        };

        (fetchDocument as jest.Mock).mockResolvedValue(existingShoppingCart);

        const response = await req()
          .send({
            query: `mutation {removeFromCart(productId: "${randomUUID()}") { userId} }`,
          })
          .expect(StatusCodes.OK);

        expect(response.body.data?.removeFromCart).toBeDefined();
        expect(response.body.data.removeFromCart.userId).toEqual(userId);
        expect(updateDocument).not.toHaveBeenCalled();
      });
    });

    describe('update product in shopping cart', () => {
      it('should update product in shopping cart', async () => {
        const productId = randomUUID();
        const newQuantity = 2;
        const cartId = randomUUID();

        const existingShoppingCart = {
          id: cartId,
          userId,
          items: [
            {
              productId,
              quantity: 1,
            },
          ],
        };

        const expectedShoppingCart = {
          id: cartId,
          userId,
          items: [
            {
              productId,
              quantity: newQuantity,
            },
          ],
        };

        (fetchDocument as jest.Mock).mockResolvedValue(existingShoppingCart);
        (updateDocument as jest.Mock).mockResolvedValue(expectedShoppingCart);

        const response = await req()
          .send({
            query: `mutation {updateQuantity(productId: "${productId}", quantity: ${newQuantity}) { userId} }`,
          })
          .expect(StatusCodes.OK);

        expect(response.body.data?.updateQuantity).toBeDefined();
        expect(response.body.data.updateQuantity.userId).toEqual(userId);
        expect(updateDocument).toHaveBeenCalledWith(cartId, expectedShoppingCart, 'shopping-cart');
      });

      it('should not update shopping cart if item does not exist', async () => {
        const productIds = [randomUUID(), randomUUID()];
        const cartId = randomUUID();

        const existingShoppingCart = {
          id: cartId,
          userId,
          items: productIds.map((productId, index) => ({
            productId,
            quantity: index + 1,
          })),
        };

        (fetchDocument as jest.Mock).mockResolvedValue(existingShoppingCart);

        const response = await req()
          .send({
            query: `mutation {updateQuantity(productId: "${randomUUID()}", quantity: 2) { userId} }`,
          })
          .expect(StatusCodes.OK);

        expect(response.body.data?.updateQuantity).toBeDefined();
        expect(response.body.data.updateQuantity.userId).toEqual(userId);
        expect(updateDocument).not.toHaveBeenCalled();
      });
    });
  });
});
