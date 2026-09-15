import { memo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Icon } from '@/components/ui';
import { useAddProductToCart } from '@/hooks/useAddProductToCart';
import { cn } from '@/lib/utils';
import { useRemoveFromCartMutation, useUpdateCartItemQuantityMutation } from '@/store/api';
import { selectCartItemQuantity } from '@/store/cartSlice';

type ProductCartControlProps = {
  className?: string;
  inStock: boolean;
  productId: string;
  productName: string;
};

const ProductCartControl = memo(function ProductCartControl({
  className,
  inStock,
  productId,
  productName,
}: ProductCartControlProps) {
  const quantity = useSelector(selectCartItemQuantity(productId));
  const { addProductToCart, isAddingToCart } = useAddProductToCart();
  const [updateQuantity, { isLoading: isUpdatingQuantity }] = useUpdateCartItemQuantityMutation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isPending = isAddingToCart || isUpdatingQuantity;

  const decrement = () => {
    if (quantity <= 1) {
      setIsDeleteDialogOpen(true);
      return;
    }

    void updateQuantity({ productId, quantity: quantity - 1 });
  };

  const increment = () => {
    void updateQuantity({ productId, quantity: quantity + 1 });
  };

  if (quantity > 0) {
    return (
      <>
        <div className={cn('flex h-10 w-full items-center justify-between rounded-md bg-primary text-primary-foreground', className)}>
          <button
            aria-label={`Уменьшить количество: ${productName}`}
            className="grid h-10 min-w-10 cursor-pointer place-items-center rounded-l-md text-base leading-6 font-bold transition-colors hover:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground"
            disabled={isPending}
            onClick={decrement}
            type="button"
          >
            -
          </button>
          <span className="min-w-8 text-center text-base leading-6 font-bold">{quantity}</span>
          <button
            aria-label={`Увеличить количество: ${productName}`}
            className="grid h-10 min-w-10 cursor-pointer place-items-center rounded-r-md text-base leading-6 font-bold transition-colors hover:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground"
            disabled={isPending}
            onClick={increment}
            type="button"
          >
            +
          </button>
        </div>
        <DeleteProductDialog
          onOpenChange={setIsDeleteDialogOpen}
          open={isDeleteDialogOpen}
          productId={productId}
          productName={productName}
        />
      </>
    );
  }

  return (
    <Button
      className={cn('h-10 w-full', className)}
      variant="iconPrimary"
      aria-label={`Добавить в корзину: ${productName}`}
      disabled={!inStock || isAddingToCart}
      onClick={() => void addProductToCart(productId)}
    >
      <Icon name="shoppingBag" />
    </Button>
  );
});

function DeleteProductDialog({
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
            className="h-10 cursor-pointer rounded-md bg-primary px-4 text-base leading-6 font-bold text-white disabled:bg-muted disabled:text-muted-foreground"
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

export { ProductCartControl };
