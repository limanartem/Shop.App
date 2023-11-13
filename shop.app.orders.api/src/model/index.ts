import Joi from 'joi';

class OrderItem {
  productId: string;
  quantity: number;
}

class OrderShippingInfo {
  address: string;
  country: string;
  postalCode: string;
}

class OrderPaymentInfo {
  creditCard?: {
    number: string;
    name: string;
    cvc: string;
    expire: string;
  };
  bank: {
    iban: string;
  };
}

export class OrderRequestPayload {
  items: OrderItem[];
  shipping: OrderShippingInfo;
  payment: OrderPaymentInfo;
}

export const OrderRequestPayloadSchema = Joi.object({
  items: Joi.array().items({
    productId: Joi.string().required(),
    quantity: Joi.number().required(),
  }).required(),
  shipping: Joi.object({
    address: Joi.string().required(),
    country: Joi.string().required(),
    postalCode: Joi.string().required(),
  }).required(),
  payment: Joi.object({
    creditCard: Joi.object({
      number: Joi.string().required(),
      name: Joi.string().required(),
      cvc: Joi.string().required(),
      expire: Joi.string().required(),
    }),
    bank: Joi.object({
      iban: Joi.string().required(),
    }),
  }).required(),
});
