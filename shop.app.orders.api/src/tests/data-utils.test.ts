import Joi from 'joi';
import { getOrders } from '../data-utils';
import { fetchDocument, fetchDocuments, insertDocument, updateDocument } from '../mongodb-client';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../mongodb-client', () => {
  return {
    fetchDocument: jest.fn(),
    fetchDocuments: jest.fn(),
    insertDocument: jest.fn(),
    updateDocument: jest.fn(),
  };
});

describe('data-utils', () => {
  describe('createOrder', () => {
    it('inserts new order document', async () => {});
  });

  describe('getOrders', () => {
    it('passes user id as criteria and returns order documents', async () => {
      const userId = '123';
      const expectedOrder = {
        _id: uuidv4(),
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
      (fetchDocuments as jest.Mock).mockImplementation(() => Promise.resolve([expectedOrder]));

      const result = await getOrders(userId);
      expect(fetchDocuments).toHaveBeenCalledWith({ userId });
      expect(result).toMatchObject([expectedOrder]);
    });
  });
});
