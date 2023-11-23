import Joi from 'joi';
import { CreateOrderRequestPayloadSchema, UpdateOrderStatusRequestPayloadSchema } from '../model';
import {
  OrderStatuses,
  OrderItemStatuses,
  ShippingStatuses,
  PaymentStatuses,
} from '../model/orders-model';

describe('UpdateOrderStatusRequestPayloadSchema validation', () => {
  test('Valid update order status request payload passes validation', () => {
    const validPayload = {
      status: OrderStatuses[0],
    };

    const validationResult = UpdateOrderStatusRequestPayloadSchema.validate(validPayload);
    expect(validationResult.error).toBeUndefined();
  });

  test('Valid edge case: All statuses set to maximum values', () => {
    const payload = {
      status: OrderStatuses[OrderStatuses.length - 1],
    };

    const result = UpdateOrderStatusRequestPayloadSchema.validate(payload);
    expect(result.error).toBeUndefined();
  });

  test('Invalid edge case: Status not in allowed values', () => {
    const payload = {
      status: 'invalid_status',
      items: [{ status: OrderItemStatuses[0], productId: '1' }],
      shipping: { status: ShippingStatuses[0] },
      payment: { status: PaymentStatuses[0] },
    };

    const result = UpdateOrderStatusRequestPayloadSchema.validate(payload);
    expect(result.error).toBeDefined();
  });
});
describe('CreateOrderRequestPayloadSchema Validation', () => {
  test('1. Valid order request payload passes validation', () => {
    const validPayload = {
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
        creditCard: {
          number: '1234567890123456',
          name: 'John Doe',
          cvc: '123',
          expire: '12/24',
        },
      },
    };

    const validationResult = CreateOrderRequestPayloadSchema.validate(validPayload);
    expect(validationResult.error).toBeUndefined();
  });

  test('Valid order request payload passes validation', () => {
    const validPayload = {
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

    const validationResult = CreateOrderRequestPayloadSchema.validate(validPayload);
    console.log(Joi.attempt(validPayload, CreateOrderRequestPayloadSchema, { stripUnknown: true }));
    expect(validationResult.error).toBeUndefined();
  });

  test('Invalid order request payload fails validation', () => {
    const invalidPayload = {
      items: [
        { productId: '12345', quantity: 2 },
        { productId: '67890', quantity: 1 },
      ],
      shipping: {
        // Missing 'address' field
        country: 'Country',
        zip: '12345',
        city: 'City',
      },
      payment: {
        creditCard: {
          number: '1234567890123456',
          name: 'John Doe',
          cvc: '123',
          // Missing 'expire' field
        },
      },
    };

    const validationResult = CreateOrderRequestPayloadSchema.validate(invalidPayload);
    expect(validationResult.error).toBeDefined();
  });

  test('1. Invalid order request payload fails validation', () => {
    const invalidPayload = {
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
        // missing payment
      },
    };

    const validationResult = CreateOrderRequestPayloadSchema.validate(invalidPayload);
    expect(validationResult.error).toBeDefined();
  });

  test('Invalid order request payload fails validation', () => {
    const invalidPayload = {
      items: [
        { productId: '12345' }, // Missing quantity
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

    const validationResult = CreateOrderRequestPayloadSchema.validate(invalidPayload);
    expect(validationResult.error).toBeDefined();
  });
});
