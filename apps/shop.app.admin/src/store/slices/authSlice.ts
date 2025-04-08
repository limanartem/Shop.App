import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: any;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isAdmin: false,
  user: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await authService.login(email, password);
    return response;
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        // Reset authentication state when login is attempted
        state.isAuthenticated = false;
        state.isAdmin = false;
        state.user = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        // Only set authenticated if we received a proper response with user data
        if (action.payload && action.payload.user) {
          state.isAuthenticated = true;
          state.isAdmin = action.payload.isAdmin;
          state.user = action.payload.user;
          state.error = null;
        } else {
          // Handle case where response is ok but doesn't have expected data
          state.isAuthenticated = false;
          state.isAdmin = false; 
          state.error = 'Invalid response format';
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.isAdmin = false;
        state.user = null;
        state.error = action.error.message || 'Invalid credentials';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
