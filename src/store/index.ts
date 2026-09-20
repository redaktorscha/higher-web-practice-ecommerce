import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './authSlice';
import { cartReducer } from './cartSlice';
import { orderReducer } from './orderSlice';
import { api } from './api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    order: orderReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
