import { shallowEqual, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CartItemRow, CartSummary } from '@/components/cart';
import { formatItemCount } from '@/lib/format';
import type { RootState } from '@/store';
import { selectCartItems, selectCartTotalItems, selectCartTotalPrice } from '@/store/cartSlice';

export function CartPage() {
  const navigate = useNavigate();
  const productIds = useSelector(
    (state: RootState) => selectCartItems(state).map((item) => item.productId),
    shallowEqual,
  );
  const totalItems = useSelector(selectCartTotalItems);
  const totalPrice = useSelector(selectCartTotalPrice);
  const itemsLabel = formatItemCount(totalItems);
  const isCartEmpty = totalItems === 0;

  return (
    <section className="md:flex flex-row justify-between md:gap-5">
      <div className="flex-2">
        <div className="mb-8 flex items-end gap-4 md:mb-4">
          <h1 className="text-2xl leading-8">Корзина</h1>
          <span className="pb-1 text-sm leading-5 text-muted-foreground md:hidden">{itemsLabel}</span>
        </div>

        <div className="gap-8 md:gap-4">
          {productIds.length > 0 ? productIds.map((productId, index) => (
            <CartItemRow key={productId} productId={productId} showMobileDivider={index < productIds.length - 1} />
          )) : (
            <div className="rounded-xl bg-card p-4 text-sm leading-5 text-muted-foreground shadow-card">Корзина пуста</div>
          )}
        </div>
      </div>

      <CartSummary
        isCartEmpty={isCartEmpty}
        itemsLabel={itemsLabel}
        onCheckout={() => {
          if (!isCartEmpty) navigate('/checkout');
        }}
        totalPrice={totalPrice}
      />
    </section>
  );
}
