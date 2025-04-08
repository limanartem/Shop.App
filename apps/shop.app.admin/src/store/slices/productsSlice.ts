import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../../services/productService';
import { UiProduct } from '../../models/product';

// Re-export the UI product interface for components
export type Product = UiProduct;

/**
 * State shape for the products slice
 */
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

/**
 * Fetch all products from the API
 */
export const fetchProducts = createAsyncThunk(
  'products/fetchAll', 
  async () => {
    // Service now returns products in UI format directly
    const products = await productService.getAllProducts();
    
    // Log for debugging purposes only
    products.forEach(product => {
      console.log('Raw product from API:', product);
    });
    
    return products;
  }
);

/**
 * Fetch a single product by ID
 */
export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id: string) => {
    // Service now returns product in UI format directly
    return await productService.getProductById(id);
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

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id: string) => {
    await productService.deleteProduct(id);
    return id; // Return the ID so we can remove it from the state
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
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create product';
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update product';
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
      })
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the deleted product from the products array
        state.products = state.products.filter(product => product.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete product';
      });
  },
});

export default productsSlice.reducer;
