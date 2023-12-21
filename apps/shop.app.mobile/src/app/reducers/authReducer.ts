import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { User } from 'supertokens-web-js/types';
import SuperTokens from 'supertokens-react-native';
import { authServiceClient } from '../../services';
import env from '../../config/environment';

const { REACT_APP_AUTH_API_URL } = env;

interface AuthState {
  user?: User | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  initialized: false,
};

const initSuperTokens = () => {
  SuperTokens.init({
    apiDomain: REACT_APP_AUTH_API_URL,
    apiBasePath: '/auth',
  });
};

/**
 * Refreshes the authentication session.
 * @returns A promise that resolves to an object containing the user and success status.
 */
export const refreshAuthSession = createAsyncThunk('/auth/refresh', async () => {
  const isLogged = await SuperTokens.doesSessionExist();

  if (isLogged) {
    const user = await authServiceClient.getUserAsync();
    return { user, success: true };
  }

  return { success: false };
});

/**
 * Sign in thunk action.
 * @param args - The sign in arguments.
 * @param args.email - The email of the user.
 * @param args.password - The password of the user.
 * @returns A promise that resolves to an object with the user and success status.
 */
export const signIn = createAsyncThunk(
  '/auth/signin',
  async (args: { email: string; password: string }) => {
    const { email, password } = args;
    const loginResponse = await authServiceClient.signInAsync(email, password);

    if (loginResponse.status === 'OK' && loginResponse.user) {
      return { user: loginResponse.user, success: true };
    }
    return { success: false };
  },
);

export const signUp = createAsyncThunk(
  '/auth/signup',
  async (args: { email: string; password: string; name: string }) => {
    const { email, password, name } = args;
    const signupResponse = await authServiceClient.signUpAsync(email, password, name);

    if (signupResponse.status === 'OK' && signupResponse.user) {
      return { user: signupResponse.user, success: true };
    }
    return { success: false };
  },
);

/**
 * Signs out the user.
 */
export const signOut = createAsyncThunk('/auth/signout', async () => {
  await SuperTokens.signOut();
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    initAuth: (state) => {
      initSuperTokens();
      state.initialized = true;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(signIn.pending, (state) => {
        state.user = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload.success ? action.payload.user : null;
      })
      .addCase(signIn.rejected, (state) => {
        state.user = null;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(refreshAuthSession.fulfilled, (state, action) => {
        state.user = action.payload.success ? action.payload.user : null;
      })
      .addCase(refreshAuthSession.rejected, (state) => {
        state.user = null;
      })
      .addCase(signUp.pending, (state) => {
        state.user = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.user = action.payload.success ? action.payload.user : null;
      })
      .addCase(signUp.rejected, (state) => {
        state.user = null;
      }),
});

export const { initAuth } = authSlice.actions;
export const selectUser = (state: RootState) => state.auth.user;
export default authSlice.reducer;
