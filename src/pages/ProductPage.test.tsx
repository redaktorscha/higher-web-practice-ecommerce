import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { ProductPage } from './ProductPage';
import { orderReducer } from '@/store/orderSlice';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { Product, ProductRating, User } from '@/types';

const user: User = {
  id: 'user-1',
  firstName: 'Иван',
  lastName: 'Иванов',
  email: 'ivan@example.com',
  createdAt: '2026-01-01T00:00:00.000Z',
  language: 'ru',
  notifyByEmail: true,
};

const product: Product = {
  id: 'product-1',
  name: 'Председатель',
  description: 'Строгие прямые усы.',
  price: 5590,
  images: ['/images/chairman.png'],
  characteristics: {},
  category: 'Классические',
  style: 'Деловой',
  density: 'Средняя',
  requiresWax: false,
  boostsCharisma: true,
  inStock: true,
  rating: 5,
  ratingCount: 125,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('ProductPage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  it('saves the selected product rating on the server', async () => {
    const clicker = userEvent.setup();
    let savedRating: ProductRating | null = null;
    let updatedProduct = product;

    localStorage.setItem('token', btoa(JSON.stringify({
      id: user.id,
      exp: Date.now() + 86_400_000,
    })));

    jest.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = typeof input === 'string' ? input : input.url;
      const method = init?.method ?? (typeof input === 'string' ? 'GET' : input.method);

      if (url.includes(`/api/products/${product.id}`) && method === 'PATCH') {
        const bodyText = typeof input === 'string'
          ? String(init?.body ?? '{}')
          : await input.clone().text();
        updatedProduct = { ...updatedProduct, ...JSON.parse(bodyText) as Partial<Product> };

        return new Response(JSON.stringify(updatedProduct), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      if (url.includes(`/api/products/${product.id}`)) {
        return new Response(JSON.stringify(updatedProduct), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      if (url.includes('/api/orders')) {
        return new Response(JSON.stringify([{ items: [{ productId: product.id }] }]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (url.includes('/api/ratings?') && method === 'GET') {
        return new Response(JSON.stringify(savedRating ? [savedRating] : []), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (url.endsWith('/api/ratings') && method === 'POST') {
        const bodyText = typeof input === 'string'
          ? String(init?.body ?? '{}')
          : await input.clone().text();
        savedRating = JSON.parse(bodyText) as ProductRating;

        return new Response(JSON.stringify(savedRating), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    renderWithProviders(
      <Routes>
        <Route path="/products/:id" element={<ProductPage />} />
      </Routes>,
      {
        route: `/products/${product.id}`,
        preloadedState: {
          auth: { user, token: 'token', isAuthenticated: true },
          order: orderReducer(undefined, { type: 'test/init' }),
        },
      },
    );

    await clicker.click(await screen.findByRole('button', { name: 'Оценить на 4' }));

    await waitFor(() => {
      expect(savedRating).toMatchObject({
        productId: product.id,
        userId: user.id,
        userName: 'Иван И.',
        rating: 4,
      });
      expect(updatedProduct).toMatchObject({ rating: 4, ratingCount: 1 });
    });
  });
});
