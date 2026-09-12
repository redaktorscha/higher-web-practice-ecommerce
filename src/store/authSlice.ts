import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { api, TOKEN_STORAGE_KEY } from './api';
import type { RootState } from './index';
import type { User } from '@/types';

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
};

type LoginFulfilledPayload = {
  token: string;
  user: User;
};

function getInitialToken() {
  return typeof window === 'undefined'
    ? null
    : localStorage.getItem(TOKEN_STORAGE_KEY);
}

const initialToken = getInitialToken();

const initialState: AuthState = {
  user: null,
  token: initialToken,
  isAuthenticated: Boolean(initialToken),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }

      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      api.endpoints.login.matchFulfilled,
      (state, action: PayloadAction<LoginFulfilledPayload>) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      },
    );

    builder.addMatcher(
      api.endpoints.getProfile.matchFulfilled,
      (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.token = getInitialToken();
        state.isAuthenticated = true;
      },
    );

    builder.addMatcher(
      api.endpoints.updateProfile.matchFulfilled,
      (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.token = getInitialToken();
        state.isAuthenticated = true;
      },
    );

    builder.addMatcher(api.endpoints.getProfile.matchRejected, (state) => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }

      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });
  },
});

export const { logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
export const selectAuth = (state: RootState) => state.auth;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectToken = (state: RootState) => state.auth.token;
