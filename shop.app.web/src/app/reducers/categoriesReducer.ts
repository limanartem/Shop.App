import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductCategory } from '../../model';
import { RootState } from '../store';
import { getCategories } from '../../services/catalog-service';

export enum DataLoadingState {
  idle,
  loading,
  loaded,
  failed 
}

interface CategoriesState {
  status: DataLoadingState;
  categories: ProductCategory[];
}

const initialState: CategoriesState = {
  status: DataLoadingState.idle,
  categories: [],
};

export const fetchCategories = createAsyncThunk('/categories', async () => {
  return await getCategories();
});

export const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<{ categories: ProductCategory[] }>) => {
      state.categories = action.payload.categories;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = DataLoadingState.loading;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = DataLoadingState.loaded;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = DataLoadingState.failed;
      });
  },
});

export const { setCategories } = categoriesSlice.actions;
export const selectCategories = (state: RootState) => state.categories.categories;
export const selectCategoriesStatus = (state: RootState) => state.categories.status;

export default categoriesSlice.reducer;
