import Joi from 'joi';
import { OrderRequestPayloadSchema } from '../model';

describe('OrderRequestPayloadSchema Validation', () => {
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

    const validationResult = OrderRequestPayloadSchema.validate(validPayload);
    expect(validationResult.error).toBeUndefined();
  });

  test('2. Valid order request payload passes validation', () => {
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

    const validationResult = OrderRequestPayloadSchema.validate(validPayload);
    console.log(Joi.attempt(validPayload, OrderRequestPayloadSchema, { stripUnknown: true}))
    expect(validationResult.error).toBeUndefined();
  });

  test('1. Invalid order request payload fails validation', () => {
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

    const validationResult = OrderRequestPayloadSchema.validate(invalidPayload);
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

    const validationResult = OrderRequestPayloadSchema.validate(invalidPayload);
    expect(validationResult.error).toBeDefined();
  });

  test('3. Invalid order request payload fails validation', () => {
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

    const validationResult = OrderRequestPayloadSchema.validate(invalidPayload);
    expect(validationResult.error).toBeDefined();
  });
});
