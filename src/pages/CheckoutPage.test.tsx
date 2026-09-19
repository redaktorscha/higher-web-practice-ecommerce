import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { CheckoutPage } from './CheckoutPage';
import { orderReducer } from '@/store/orderSlice';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { Order, Product, User } from '@/types';

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

function mockFetch() {
  let createdOrder: Order | null = null;
  let cartRecords = [{
    id: 'cart-record-1',
    userId: user.id,
    productId: product.id,
    product,
    quantity: 1,
    price: product.price,
  }];

  localStorage.setItem('token', btoa(JSON.stringify({
    id: user.id,
    exp: Date.now() + 86_400_000,
  })));

  const fetchSpy = jest.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    const method = init?.method ?? (typeof input === 'string' ? 'GET' : input.method);

    if (url.includes('/api/pickupPoints')) {
      return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (url.includes('/api/orders') && method === 'POST') {
      const bodyText = typeof input === 'string'
        ? String(init?.body ?? '{}')
        : await input.clone().text();
      const body = JSON.parse(bodyText) as Order;

      createdOrder = body;

      return new Response(JSON.stringify(body), { status: 201, headers: { 'Content-Type': 'application/json' } });
    }

    if (url.includes(`/api/cart/${cartRecords[0]?.id}`) && method === 'DELETE') {
      cartRecords = [];

      return new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (url.includes('/api/cart?') && method === 'GET') {
      return new Response(JSON.stringify(cartRecords), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  });

  return {
    fetchSpy,
    getCreatedOrder: () => createdOrder,
    getCartRecords: () => cartRecords,
  };
}

describe('CheckoutPage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  it('validates required fields before payment', async () => {
    const clicker = userEvent.setup();

    renderWithProviders(<CheckoutPage />, {
      preloadedState: {
        auth: { user, token: 'token', isAuthenticated: true },
        cart: {
          items: [{ productId: product.id, product, quantity: 1, price: product.price }],
          totalItems: 1,
          totalPrice: product.price,
        },
        order: orderReducer(undefined, { type: 'test/init' }),
      },
    });

    await clicker.click(screen.getByRole('button', { name: 'Оплатить' }));

    expect(screen.getByText('Выберите город')).toBeInTheDocument();
    expect(screen.getByText('Введите адрес доставки')).toBeInTheDocument();
    expect(screen.getByText('Введите номер телефона')).toBeInTheDocument();
  });

  it('submits order and navigates to success screen', async () => {
    const clicker = userEvent.setup();
    const { getCreatedOrder, getCartRecords } = mockFetch();

    const { store } = renderWithProviders(
      <Routes>
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/success" element={<h1>Спасибо за покупку</h1>} />
      </Routes>,
      {
        route: '/checkout',
        preloadedState: {
          auth: { user, token: 'token', isAuthenticated: true },
          cart: {
            items: [{ productId: product.id, product, quantity: 1, price: product.price }],
            totalItems: 1,
            totalPrice: product.price,
          },
          order: orderReducer(undefined, { type: 'test/init' }),
        },
      },
    );

    await clicker.click(screen.getByRole('button', { name: 'Город *' }));
    await clicker.click(screen.getByRole('button', { name: 'Москва' }));
    await clicker.type(screen.getByPlaceholderText('улица, дом, квартира *'), 'Тверская, 1');
    await clicker.type(screen.getByLabelText('Номер телефона *'), '+7 999 123-45-67');
    await clicker.click(screen.getByRole('button', { name: 'Оплатить' }));

    expect(await screen.findByRole('heading', { name: 'Спасибо за покупку' })).toBeInTheDocument();
    expect(store.getState().cart).toEqual({ items: [], totalItems: 0, totalPrice: 0 });
    expect(getCartRecords()).toEqual([]);

    await waitFor(() => {
      expect(getCreatedOrder()).toMatchObject({
        userId: user.id,
        paymentMethod: 'cash',
        deliveryMethod: 'courier',
        totalPrice: product.price,
        customer: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: '+7 999 123-45-67',
        },
      });
    });
  });
});
