import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { CartPage } from './CartPage';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { Product } from '@/types';

const product: Product = {
  id: 'product-1',
  name: 'Инженер',
  description: 'Надежные усы для точных расчетов.',
  price: 2650,
  images: ['/images/engineer.png'],
  characteristics: {},
  category: 'Классические',
  style: 'Деловой',
  density: 'Высокая',
  requiresWax: false,
  boostsCharisma: true,
  inStock: true,
  rating: 5,
  ratingCount: 10,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('CartPage', () => {
  it('disables checkout button when cart is empty', () => {
    renderWithProviders(<CartPage />, {
      preloadedState: {
        cart: { items: [], totalItems: 0, totalPrice: 0 },
      },
    });

    screen.getAllByRole('button', { name: 'Оформить заказ' }).forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('navigates to checkout when cart has products', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/profile/cart" element={<CartPage />} />
        <Route path="/checkout" element={<h1>Оформление заказа</h1>} />
      </Routes>,
      {
        route: '/profile/cart',
        preloadedState: {
          cart: {
            items: [{ productId: product.id, product, quantity: 1, price: product.price }],
            totalItems: 1,
            totalPrice: product.price,
          },
        },
      },
    );

    await user.click(screen.getAllByRole('button', { name: 'Оформить заказ' })[0]);

    expect(screen.getByRole('heading', { name: 'Оформление заказа' })).toBeInTheDocument();
  });
});
