import { cartReducer, clearCart, selectCartItemQuantity, selectCartTotalItems, selectCartTotalPrice, setCart } from './cartSlice';
import type { RootState } from './index';
import type { CartItem, Product } from '@/types';

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

const item: CartItem = {
  productId: product.id,
  product,
  quantity: 2,
  price: product.price,
};

function fulfilledAction(endpointName: string, payload: unknown, operation: 'query' | 'mutation' = 'mutation') {
  return {
    type: `api/execute${operation === 'query' ? 'Query' : 'Mutation'}/fulfilled`,
    payload,
    meta: {
      requestId: 'test-request',
      requestStatus: 'fulfilled',
      arg: { endpointName },
    },
  };
}

describe('cartSlice', () => {
  it('sets and clears cart state', () => {
    const cart = {
      items: [item],
      totalItems: 2,
      totalPrice: 11180,
    };

    const filledState = cartReducer(undefined, setCart(cart));
    const emptyState = cartReducer(filledState, clearCart());

    expect(filledState).toEqual(cart);
    expect(emptyState).toEqual({ items: [], totalItems: 0, totalPrice: 0 });
  });

  it('updates totals after successful add and quantity update mutations', () => {
    const addedState = cartReducer(undefined, fulfilledAction('addToCart', item));
    const updatedState = cartReducer(addedState, fulfilledAction('updateCartItemQuantity', {
      ...item,
      quantity: 3,
    }));

    expect(updatedState.totalItems).toBe(3);
    expect(updatedState.totalPrice).toBe(16770);
    expect(updatedState.items[0]?.quantity).toBe(3);
  });

  it('removes item after successful remove mutation', () => {
    const filledState = cartReducer(undefined, setCart({
      items: [item],
      totalItems: 2,
      totalPrice: 11180,
    }));
    const nextState = cartReducer(filledState, fulfilledAction('removeFromCart', { productId: product.id }));

    expect(nextState.items).toHaveLength(0);
    expect(nextState.totalItems).toBe(0);
    expect(nextState.totalPrice).toBe(0);
  });

  it('selects totals and product quantity from RootState', () => {
    const rootState = {
      cart: {
        items: [item],
        totalItems: 2,
        totalPrice: 11180,
      },
    } as RootState;

    expect(selectCartTotalItems(rootState)).toBe(2);
    expect(selectCartTotalPrice(rootState)).toBe(11180);
    expect(selectCartItemQuantity(product.id)(rootState)).toBe(2);
    expect(selectCartItemQuantity('missing-product')(rootState)).toBe(0);
  });
});
