import { ObjectId } from 'mongodb';
import { getOrders, getOrder, updateOrder } from '../data-utils';
import { fetchDocuments, fetchDocument, updateDocument } from '../mongodb-client';
import { v4 as uuidv4 } from 'uuid';
import { getObject, updateObject } from '../cache-utils';
import { Status } from '../model/orders-model';

jest.mock('../mongodb-client', () => {
  return {
    fetchDocument: jest.fn(),
    fetchDocuments: jest.fn(),
    insertDocument: jest.fn(),
    updateDocument: jest.fn(),
  };
});

jest.mock('../cache-utils', () => ({
  getObject: jest.fn(),
  updateObject: jest.fn(),
}));

const ORDERS_CACHE_GROUP = 'orders';
describe('data-utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  describe('getOrder', () => {
    const userId = uuidv4();
    const orderId = ObjectId.createFromTime(new Date().getTime()).toHexString();
    const expectedOrder = {
      _id: orderId,
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

    describe('if order is not in the cache', () => {
      beforeEach(() => {
        (fetchDocument as jest.Mock).mockResolvedValue(expectedOrder);
        (getObject as jest.Mock).mockResolvedValue(null);
      });

      it('checks cache first', async () => {
        await getOrder(orderId, userId);
        expect(getObject).toHaveBeenCalledWith(orderId, ORDERS_CACHE_GROUP);
      });

      it('fetches order from db with criteria', async () => {
        const result = await getOrder(orderId, userId);
        expect(fetchDocument).toHaveBeenCalledWith({
          _id: ObjectId.createFromHexString(orderId),
          userId,
        });
        expect(result).toMatchObject(expectedOrder);
      });

      it('puts order in to cache', async () => {
        await getOrder(orderId, userId);
        expect(updateObject).toHaveBeenCalledWith(orderId, expectedOrder, ORDERS_CACHE_GROUP);
      });
    });

    it('returns cached object if cache is available', async () => {
      const userId = uuidv4();
      const orderId = ObjectId.createFromTime(new Date().getTime()).toHexString();
      const expectedOrder = {
        _id: orderId,
        items: [
          { productId: uuidv4(), quantity: 2 },
          { productId: uuidv4(), quantity: 1 },
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
      (getObject as jest.Mock).mockResolvedValue(expectedOrder);
      const result = await getOrder(orderId, userId);
      expect(fetchDocument).not.toHaveBeenCalled();
      expect(getObject).toHaveBeenCalledWith(orderId, ORDERS_CACHE_GROUP);
      expect(result).toMatchObject(expectedOrder);
    });
  });

  describe('updateOrder', () => {
    it('updates order document and invalidates cache', async () => {
      const orderId = ObjectId.createFromTime(new Date().getTime()).toHexString();
      const updatedOrder = {
        status: 'paid' as Status,
        updatedAt: new Date(),
        updatedBy: 'test',
      };
      (updateDocument as jest.Mock).mockResolvedValue(true);

      const result = await updateOrder(orderId, updatedOrder);

      expect(result).toBeTruthy();
      expect(updateDocument).toHaveBeenCalledWith(orderId, updatedOrder);
      expect(updateObject).toHaveBeenCalledWith(orderId, null, ORDERS_CACHE_GROUP);
    });
  });
});
