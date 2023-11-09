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
  id: string,
  parentCategoryId: string
  title: string
}