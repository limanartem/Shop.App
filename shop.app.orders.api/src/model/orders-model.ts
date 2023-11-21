import Joi from 'joi';
import { ProductItem } from './catalog-model';
import { Document } from 'mongodb';


export type OrderFlow = 'pending' | 'payment' | 'dispatch' | 'failed';

export type Status =
  | 'pending'
  | 'confirmed'
  | 'rejected'
  | 'failed'
  | 'paid'
  | 'unavailable'
  | 'dispatched'
  | 'delivered';

type UpdateStatusItem = {
  status?: Status;
};

export const OrderStatuses: Status[] = [
  'pending',
  'confirmed',
  'paid',
  'rejected',
  'dispatched',
  'delivered',
];


export const OrderItemStatuses: Status[] = ['pending', 'confirmed'];
export const PaymentStatuses: Status[] = ['pending', 'rejected', 'paid'];
export const ShippingStatuses: Status[] = ['pending', 'dispatched', 'delivered'];

export type OrderItem = {
  productId: string;
  quantity: number;
  status?: Status;
};

export type OrderItemEnhanced = OrderItem & {
  product?: ProductItem;
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

export interface UpdateOrderStatusRequest {
  status: Status;
}

export interface Order<TItem extends OrderItem = OrderItem> extends Document {
  items: TItem[];
  shipping: OrderShippingInfo;
  payment: OrderPaymentInfo;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  status: Status;
}

export interface UpdateOrder extends UpdateOrderStatusRequest {
  updatedAt: Date;
  updatedBy: string;
}

export const CreateOrderRequestPayloadSchema = Joi.object({
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

export const UpdateOrderStatusRequestPayloadSchema = Joi.object({
  status: Joi.string()
    .valid(...OrderStatuses)
    .required(),
});
