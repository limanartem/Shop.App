import { ProductCategory, ProductItem } from '../model';

export const getProducts = async (_catagory?: string | null): Promise<ProductItem[]> => {
  return Promise.resolve([
    {
      id: '1235',
      title: 'Samsung 17"',
      description: 'Some description',
      price: 400.5,
      currency: '$',
    },
    {
      id: '894651',
      title: 'Bosch dishwasher',
      description: 'Some description <b>with tags</b>',
      price: 330.75,
      currency: '$',
    },
  ]);
};

export const getCategories = async (): Promise<ProductCategory[]> => {
  return Promise.resolve([
    {
      id: '1',
      title: 'Electronics',
    },
    {
      id: '2',
      title: 'Clothes',
    },
  ]);
};
