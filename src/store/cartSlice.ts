import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { api } from './api';
import { logout } from './authSlice';
import type { RootState } from './index';
import type { Cart, CartItem } from '@/types';

type CartState = Cart;

const initialState: CartState = {
  items: [],
  totalPrice: 0,
  totalItems: 0,
};

function recalculateCart(state: CartState) {
  state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  state.totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function upsertCartItem(state: CartState, item: CartItem) {
  const existingItem = state.items.find((cartItem) => cartItem.productId === item.productId);

  if (existingItem) {
    existingItem.product = item.product;
    existingItem.quantity = item.quantity;
    existingItem.price = item.price;
  } else {
    state.items.push(item);
  }

  recalculateCart(state);
}

function removeCartItem(state: CartState, productId: string) {
  state.items = state.items.filter((item) => item.productId !== productId);
  recalculateCart(state);
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: () => initialState,
    setCart: (_state, action: PayloadAction<Cart>) => action.payload,
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);

    builder.addMatcher(api.endpoints.getCart.matchFulfilled, (_state, action: PayloadAction<Cart>) => action.payload);

    builder.addMatcher(api.endpoints.addToCart.matchFulfilled, (state, action: PayloadAction<CartItem>) => {
      upsertCartItem(state, action.payload);
    });

    builder.addMatcher(api.endpoints.updateCartItemQuantity.matchFulfilled, (state, action: PayloadAction<CartItem>) => {
      upsertCartItem(state, action.payload);
    });

    builder.addMatcher(api.endpoints.removeFromCart.matchFulfilled, (state, action: PayloadAction<{ productId: string }>) => {
      removeCartItem(state, action.payload.productId);
    });

    builder.addMatcher(api.endpoints.getProfile.matchRejected, () => initialState);
  },
});

export const { clearCart, setCart } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
export const selectCart = (state: RootState) => state.cart;
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartTotalItems = (state: RootState) => state.cart.totalItems;
export const selectCartTotalPrice = (state: RootState) => state.cart.totalPrice;
export const selectCartItem = (productId: string) => (state: RootState) =>
  state.cart.items.find((item) => item.productId === productId) ?? null;
export const selectCartItemQuantity = (productId: string) => (state: RootState) =>
  state.cart.items.find((item) => item.productId === productId)?.quantity ?? 0;
