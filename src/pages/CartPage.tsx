import { Trash } from 'lucide-react';
import { memo, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import shoppingImage from '@/assets/shopping.png';
import {
  selectCartItem,
  selectCartItems,
  selectCartTotalItems,
  selectCartTotalPrice,
} from '@/store/cartSlice';
import {
  useRemoveFromCartMutation,
  useUpdateCartItemQuantityMutation,
} from '@/store/api';
import type { RootState } from '@/store';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';

const currency = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

function getItemsLabel(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} товар`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} товара`;
  }

  return `${count} товаров`;
}

export function CartPage() {
  const productIds = useSelector((state: RootState) => selectCartItems(state).map((item) => item.productId), shallowEqual);
  const totalItems = useSelector(selectCartTotalItems);
  const totalPrice = useSelector(selectCartTotalPrice);
  const itemsLabel = getItemsLabel(totalItems);

  return (
    <section className="md:grid md:grid-cols-[580px_280px] md:gap-5">
      <div>
        <div className="mb-8 flex items-end gap-4 md:mb-4">
          <h1 className="text-2xl leading-8">Корзина</h1>
          <span className="pb-1 text-sm leading-5 text-muted-foreground md:hidden">{itemsLabel}</span>
        </div>

        <div className="grid gap-8 md:gap-4">
          {productIds.length > 0 ? productIds.map((productId, index) => (
            <CartItemRow key={productId} productId={productId} showMobileDivider={index < productIds.length - 1} />
          )) : (
            <div className="rounded-xl bg-card p-4 text-sm leading-5 text-muted-foreground shadow-card">Корзина пуста</div>
          )}
        </div>
      </div>

      <aside className="hidden md:block">
        <div className="rounded-xl bg-card p-4 shadow-card">
          <div className="mb-4 flex items-start justify-between">
            <h2 className="text-xl leading-5">Ваша корзина</h2>
            <span className="text-sm leading-5 text-muted-foreground">{itemsLabel}</span>
          </div>
          <div className="mb-4 flex items-end justify-between">
            <span className="text-xs leading-4 text-muted-foreground">сумма заказа</span>
            <span className="text-[30px] leading-9 font-bold text-success">{currency.format(totalPrice)}</span>
          </div>
          <button className="h-10 w-full rounded-md bg-primary px-4 text-base leading-6 font-bold text-white" type="button">
            Оформить заказ
          </button>
        </div>
        <img alt="" className="mt-12 h-[396px] w-[288px] object-contain" src={shoppingImage} />
      </aside>

      <div className="fixed right-0 bottom-[58px] left-0 rounded-t-xl border border-border bg-card px-5 py-4 md:hidden">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-xl leading-5 font-bold text-success">{currency.format(totalPrice)}</span>
          <span className="text-sm leading-5 text-muted-foreground">{itemsLabel}</span>
        </div>
        <button className="h-9 w-full rounded-md bg-primary px-4 text-sm leading-5 font-bold text-white" type="button">
          Оформить заказ
        </button>
      </div>
    </section>
  );
}

const CartItemRow = memo(function CartItemRow({
  productId,
  showMobileDivider,
}: {
  productId: string;
  showMobileDivider: boolean;
}) {
  const item = useSelector(selectCartItem(productId));
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!item) {
    return null;
  }

  return (
    <article>
      <div className="grid grid-cols-[60px_1fr_auto] gap-x-4 md:h-28 md:grid-cols-[72px_1fr_104px_86px_24px] md:items-center md:gap-8 md:rounded-xl md:bg-card md:p-4 md:shadow-card">
        <img alt="" className="h-[60px] w-[60px] rounded-lg bg-card object-contain md:h-10 md:w-[72px] md:rounded-none md:bg-transparent" src={item.product.images[0]} />
        <div className="grid content-start gap-8 md:block">
          <Link className="text-sm leading-5 text-primary-hover md:text-base md:leading-6" to={`/products/${item.productId}`}>
            {item.product.name}
          </Link>
          <div className="md:hidden">
            <CartQuantityCounter onRequestRemove={() => setIsDeleteDialogOpen(true)} productId={item.productId} quantity={item.quantity} />
          </div>
        </div>
        <div className="grid justify-items-end gap-8 md:hidden">
          <p className="text-sm leading-5 font-bold">{currency.format(item.price * item.quantity)}</p>
          <button className="text-primary md:hidden" onClick={() => setIsDeleteDialogOpen(true)} type="button" aria-label="Удалить">
            <Trash className="size-9" />
          </button>
        </div>
        <div className="col-span-3 mt-6 md:hidden">
          <p className="text-sm leading-5 text-[#9ca3af]">Доставят</p>
          <p className="text-sm leading-5">30 февраля 2025 г.</p>
        </div>
        <div className="hidden md:block">
          <CartQuantityCounter onRequestRemove={() => setIsDeleteDialogOpen(true)} productId={item.productId} quantity={item.quantity} />
        </div>
        <p className="hidden text-2xl leading-8 font-bold md:block">{currency.format(item.price * item.quantity)}</p>
        <button className="hidden text-primary md:block" onClick={() => setIsDeleteDialogOpen(true)} type="button" aria-label="Удалить">
          <Trash className="size-6" />
        </button>
      </div>
      {showMobileDivider ? <div className="mt-8 border-t border-border md:hidden" /> : null}
      <DeleteCartItemDialog
        onOpenChange={setIsDeleteDialogOpen}
        open={isDeleteDialogOpen}
        productId={item.productId}
        productName={item.product.name}
      />
    </article>
  );
});

const CartQuantityCounter = memo(function CartQuantityCounter({
  onRequestRemove,
  productId,
  quantity,
}: {
  onRequestRemove: () => void;
  productId: string;
  quantity: number;
}) {
  const [updateQuantity, { isLoading }] = useUpdateCartItemQuantityMutation();

  const decrement = () => {
    if (quantity <= 1) {
      onRequestRemove();
      return;
    }

    void updateQuantity({ productId, quantity: quantity - 1 });
  };

  const increment = () => {
    void updateQuantity({ productId, quantity: quantity + 1 });
  };

  return (
    <div className="flex items-center gap-4 md:gap-3">
      <button
        className="grid size-8 place-items-center rounded-md bg-border text-sm leading-5 disabled:opacity-60"
        disabled={isLoading}
        onClick={decrement}
        type="button"
        aria-label="Уменьшить количество"
      >
        -
      </button>
      <span className="text-2xl leading-8 font-bold">{quantity}</span>
      <button
        className="grid size-8 place-items-center rounded-md bg-border text-sm leading-5 disabled:opacity-60"
        disabled={isLoading}
        onClick={increment}
        type="button"
        aria-label="Увеличить количество"
      >
        +
      </button>
    </div>
  );
});

function DeleteCartItemDialog({
  onOpenChange,
  open,
  productId,
  productName,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  productId: string;
  productName: string;
}) {
  const [removeFromCart, { isLoading }] = useRemoveFromCartMutation();

  const confirmDelete = async () => {
    await removeFromCart({ productId }).unwrap();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить совсем?</DialogTitle>
          <DialogDescription>
            {productName} будет удалён из корзины.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose className="h-10 rounded-md border border-primary bg-card px-4 text-base leading-6 font-bold text-primary" disabled={isLoading}>
            Отмена
          </DialogClose>
          <button
            className="h-10 rounded-md bg-primary px-4 text-base leading-6 font-bold text-white disabled:bg-muted disabled:text-muted-foreground"
            disabled={isLoading}
            onClick={() => void confirmDelete()}
            type="button"
          >
            {isLoading ? 'Удаляем...' : 'Удалить'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
