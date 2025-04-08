import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../../services/productService';

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
}

interface ProductsState {
  products: Product[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk('products/fetchAll', async () => {
  const response = await productService.getAllProducts();
  return response;
});

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id: string) => {
    const response = await productService.getProductById(id);
    return response;
  }
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (product: Product) => {
    const response = await productService.createProduct(product);
    return response;
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async (product: Product) => {
    const response = await productService.updateProduct(product);
    return response;
  }
);

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch product';
      });
  },
});

export default productsSlice.reducer;
