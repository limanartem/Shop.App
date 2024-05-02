import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { User } from 'supertokens-web-js/types';

type UserExt = User & {
  hasSignedIn: boolean;
};

interface AuthState {
  user?: UserExt | null;
}

const initialState: AuthState = {
  user: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserExt | null>) => {
      state.user = action.payload;
    },
  },
});

export const { setUser } = authSlice.actions;
export const selectUser = (state: RootState) => state.auth.user;
export default authSlice.reducer;
