import Joi from 'joi';
import { ProductItem } from './catalog-model';
import { Document } from 'mongodb';

type OrderItem = {
  productId: string;
  quantity: number;
  status?: 'pending' | 'confirmed';
};

export type OrderItemEnhanced = OrderItem & {
  product: ProductItem;
};

type OrderShippingInfo = {
  address: string;
  country: string;
  city: string;
  state?: string;
  zip: string;
  name?: string;
};

type OrderPaymentInfo = {
  creditCard?: {
    number: string;
    name: string;
    cvc: string;
    expire: string;
  };
  bank?: {
    iban: string;
  };
};

export interface CreateOrderRequest {
  items: OrderItem[];
  shipping: OrderShippingInfo;
  payment: OrderPaymentInfo;
}

export interface Order<TItem extends OrderItem = OrderItem> extends Document {
  items: TItem[];
  shipping: OrderShippingInfo;
  payment: OrderPaymentInfo;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'pending';
}

export const OrderRequestPayloadSchema = Joi.object({
  items: Joi.array()
    .items({
      productId: Joi.string().required(),
      quantity: Joi.number().required(),
    })
    .required(),
  shipping: Joi.object({
    address: Joi.string().required(),
    country: Joi.string().required(),
    zip: Joi.string().required(),
    city: Joi.string().required(),
  }).required(),
  payment: Joi.alternatives()
    .try(
      Joi.object({
        creditCard: Joi.object({
          number: Joi.string().required(),
          name: Joi.string().required(),
          cvc: Joi.string().required(),
          expire: Joi.string().required(),
        }).required(),
      }).required(),
      Joi.object({
        bank: Joi.object({
          iban: Joi.string().required(),
        }).required(),
      }).required(),
    )
    .required(),
});
