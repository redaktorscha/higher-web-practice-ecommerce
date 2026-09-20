import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { useRemoveFromCartMutation } from '@/store/api';

type RemoveCartItemDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  productId: string;
  productName: string;
};

export function RemoveCartItemDialog({
  onOpenChange,
  open,
  productId,
  productName,
}: RemoveCartItemDialogProps) {
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
          <DialogClose
            className="h-10 rounded-md border border-primary bg-card px-4 text-base leading-6 font-bold text-primary"
            disabled={isLoading}
          >
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
