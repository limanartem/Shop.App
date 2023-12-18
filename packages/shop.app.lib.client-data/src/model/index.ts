export type ProductItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images?: string[];
  capacity?: number;
  category?: string;
};

export type ProductCategory = {
  id: number;
  parentCategoryId?: number;
  title: string;
};

export type ShoppingCartItem = {
  product: ProductItem;
  quantity: number;
  status?: string;
};

type CheckoutItem = {
  productId: string;
  quantity: number;
}

type OrderItem = ShoppingCartItem & CheckoutItem;

export type CheckoutShippingInfo  = {
  address?: string;
  country?: string;
  city?: string;
  state?: string;
  zip?: string;
  name?: string;
}

export type CreditCardDetails = {
  number?: string;
  name?: string;
  cvc?: string;
  expire?: string;
};

export type BankDetails = {
  iban?: string;
};

export type CheckoutPaymentInfo = {
  creditCard?: CreditCardDetails;
  bank?: BankDetails;
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

export type CreateOrder = {
  items: CheckoutItem[];
  payment: CheckoutPaymentInfo;
  shipping: CheckoutShippingInfo;
}

export type Order = {
  id: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  shipping: OrderShippingInfo;
  payment: OrderPaymentInfo;
};

export type OrdersResponse = {
  orders: Order[];
};
