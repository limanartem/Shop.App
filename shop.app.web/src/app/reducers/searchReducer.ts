import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface SearchState {
  category?: string | null;
}

const initialState: SearchState = {
  category: null,
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<string | null>) => {
      state.category = action.payload;
    },
  },
});

export const { setCategory } = searchSlice.actions;
export const selectSearchCategory = (state: RootState) => state.search;

export default searchSlice.reducer;
