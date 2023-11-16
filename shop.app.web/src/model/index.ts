export type ProductItem = {
  id: string,
  title: string,
  description: string,
  price: number,
  currency: string,
  images?: string[],
  capacity?: number,
  category?: string
}

export type ProductCategory = {
  id: number,
  parentCategoryId?: number
  title: string
}

export type ShoppingCartItem = {
  product: ProductItem;
  quantity: number;
  status?: string
};


type OrderItem = ShoppingCartItem & {
  productId: string;
  quantity: number;
}

type OrderShippingInfo = {
  address: string;
  country: string;
  city: string;
  state?: string;
  zip: string;
  name?: string;
}

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
}

export type Order = {
  id: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  shipping: OrderShippingInfo;
  payment: OrderPaymentInfo;
}

export type OrdersResponse = {
  orders: Order[];
}