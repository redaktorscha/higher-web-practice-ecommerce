import { configureStore } from '@reduxjs/toolkit';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { api } from '@/store/api';
import { authReducer } from '@/store/authSlice';
import { cartReducer } from '@/store/cartSlice';
import { orderReducer } from '@/store/orderSlice';
import type { RootState } from '@/store';

type RenderOptions = {
  preloadedState?: Partial<RootState>;
  route?: string;
};

function makeTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      order: orderReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
    preloadedState,
  });
}

export function renderWithProviders(
  ui: ReactElement,
  { preloadedState, route = '/' }: RenderOptions = {},
) {
  const store = makeTestStore(preloadedState);

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </Provider>,
    ),
  };
}
