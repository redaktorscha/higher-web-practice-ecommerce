import { Trash } from 'lucide-react';
import { memo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { useRemoveFromCartMutation, useUpdateCartItemQuantityMutation } from '@/store/api';
import { selectCartItem } from '@/store/cartSlice';
import { rubleCurrency } from '@/lib/format';

export const CartItemRow = memo(function CartItemRow({ productId, showMobileDivider }: {
  productId: string;
  showMobileDivider: boolean;
}) {
  const item = useSelector(selectCartItem(productId));
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!item) return null;

  return (
    <article>
      <div className="grid grid-cols-[60px_1fr_auto] gap-x-4 md:h-28 md:grid-cols-[72px_1fr_104px_86px_24px] md:items-center md:gap-8 md:rounded-xl md:bg-card md:p-4 md:shadow-card">
        <img alt="" className="h-[60px] w-[60px] rounded-lg bg-card object-contain md:h-10 md:w-[72px] md:rounded-none md:bg-transparent" src={item.product.images[0]} />
        <div className="grid content-start gap-8 md:block">
          <Link className="cursor-pointer text-sm leading-5 text-primary-hover md:text-base md:leading-6" to={`/products/${item.productId}`}>
            {item.product.name}
          </Link>
          <div className="md:hidden">
            <CartQuantityCounter onRequestRemove={() => setIsDeleteDialogOpen(true)} productId={item.productId} quantity={item.quantity} />
          </div>
        </div>
        <div className="grid justify-items-end gap-8 md:hidden">
          <p className="text-sm leading-5 font-bold">{rubleCurrency.format(item.price * item.quantity)}</p>
          <DeleteButton className="cursor-pointer text-primary md:hidden" onClick={() => setIsDeleteDialogOpen(true)} size="size-9" />
        </div>
        <div className="col-span-3 mt-6 md:hidden">
          <p className="text-sm leading-5 text-[#9ca3af]">Доставят</p>
          <p className="text-sm leading-5">30 февраля 2025 г.</p>
        </div>
        <div className="hidden md:block">
          <CartQuantityCounter onRequestRemove={() => setIsDeleteDialogOpen(true)} productId={item.productId} quantity={item.quantity} />
        </div>
        <p className="hidden text-2xl leading-8 font-bold md:block">{rubleCurrency.format(item.price * item.quantity)}</p>
        <DeleteButton className="hidden cursor-pointer text-primary md:block" onClick={() => setIsDeleteDialogOpen(true)} size="size-6" />
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

function DeleteButton({ className, onClick, size }: { className: string; onClick: () => void; size: string }) {
  return (
    <button aria-label="Удалить" className={className} onClick={onClick} type="button">
      <Trash className={size} />
    </button>
  );
}

const CartQuantityCounter = memo(function CartQuantityCounter({ onRequestRemove, productId, quantity }: {
  onRequestRemove: () => void;
  productId: string;
  quantity: number;
}) {
  const [updateQuantity, { isLoading }] = useUpdateCartItemQuantityMutation();

  const changeQuantity = (nextQuantity: number) => {
    if (nextQuantity < 1) onRequestRemove();
    else void updateQuantity({ productId, quantity: nextQuantity });
  };

  return (
    <div className="flex items-center gap-4 md:gap-3">
      <button aria-label="Уменьшить количество" className="grid size-8 cursor-pointer place-items-center rounded-md bg-border text-sm leading-5 disabled:opacity-60" disabled={isLoading} onClick={() => changeQuantity(quantity - 1)} type="button">-</button>
      <span className="text-2xl leading-8 font-bold">{quantity}</span>
      <button aria-label="Увеличить количество" className="grid size-8 cursor-pointer place-items-center rounded-md bg-border text-sm leading-5 disabled:opacity-60" disabled={isLoading} onClick={() => changeQuantity(quantity + 1)} type="button">+</button>
    </div>
  );
});

function DeleteCartItemDialog({ onOpenChange, open, productId, productName }: {
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
          <DialogDescription>{productName} будет удалён из корзины.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose className="h-10 rounded-md border border-primary bg-card px-4 text-base leading-6 font-bold text-primary" disabled={isLoading}>Отмена</DialogClose>
          <button className="h-10 cursor-pointer rounded-md bg-primary px-4 text-base leading-6 font-bold text-white disabled:bg-muted disabled:text-muted-foreground" disabled={isLoading} onClick={() => void confirmDelete()} type="button">
            {isLoading ? 'Удаляем...' : 'Удалить'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
