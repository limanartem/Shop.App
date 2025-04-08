import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryService } from '../../services/categoryService';
import { UiCategory } from '../../models/category';

/**
 * State interface for the categories slice
 */
interface CategoriesState {
  categories: UiCategory[];
  loading: boolean;
  error: string | null;
  selectedCategory: UiCategory | null;
}

/**
 * Initial state for the categories slice
 */
const initialState: CategoriesState = {
  categories: [],
  loading: false,
  error: null,
  selectedCategory: null,
};

/**
 * Async thunk to fetch all categories
 */
export const fetchCategories = createAsyncThunk<UiCategory[], void>(
  'categories/fetchAll',
  async () => {
    const categories = await categoryService.getAllCategories();
    return categories;
  }
);

/**
 * Async thunk to fetch a single category by ID
 */
export const fetchCategoryById = createAsyncThunk<UiCategory, number>(
  'categories/fetchById',
  async (categoryId: number) => {
    const category = await categoryService.getCategoryById(categoryId);
    return category;
  }
);

/**
 * Async thunk to create a new category
 */
export const createCategory = createAsyncThunk<UiCategory, Partial<UiCategory>>(
  'categories/create',
  async (category: Partial<UiCategory>) => {
    const newCategory = await categoryService.createCategory(category);
    return newCategory;
  }
);

/**
 * Categories slice with reducers and extra reducers for async actions
 */
export const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      
      // Fetch category by ID
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch category';
      })
      
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create category';
      });
  },
});

// Export the reducer and actions
export const { clearSelectedCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;
