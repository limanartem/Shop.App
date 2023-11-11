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
  parentCategoryId: number
  title: string
}

export type ShoppingCartItem = {
  productId: string;
  quantity: number;
};
