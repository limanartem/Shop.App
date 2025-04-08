import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

// Helper functions to load/save auth state from localStorage
const loadAuthState = (): Partial<AuthState> => {
  try {
    const serializedState = localStorage.getItem('authState');
    if (serializedState === null) {
      return {};
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading auth state:', err);
    return {};
  }
};

const saveAuthState = (state: AuthState) => {
  try {
    const serializedState = JSON.stringify({
      isAuthenticated: state.isAuthenticated,
      isAdmin: state.isAdmin,
      user: state.user
    });
    localStorage.setItem('authState', serializedState);
  } catch (err) {
    console.error('Error saving auth state:', err);
  }
};

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: any;
  loading: boolean;
  error: string | null;
}

// Load persisted state from localStorage or use defaults
const savedState = loadAuthState();

const initialState: AuthState = {
  isAuthenticated: savedState.isAuthenticated || false,
  isAdmin: savedState.isAdmin || false,
  user: savedState.user || null,
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
      // Clear persisted state on logout
      localStorage.removeItem('authState');
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
          // Save auth state to localStorage when login succeeds
          saveAuthState(state);
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
