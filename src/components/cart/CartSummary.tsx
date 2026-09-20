import { rubleCurrency } from '@/lib/format';
import shoppingImage from '@/assets/shopping.png';

export function CartSummary({ isCartEmpty, itemsLabel, onCheckout, totalPrice }: {
  isCartEmpty: boolean;
  itemsLabel: string;
  onCheckout: () => void;
  totalPrice: number;
}) {
  const checkoutButton = (className: string) => (
    <button className={className} disabled={isCartEmpty} onClick={onCheckout} type="button">
      Оформить заказ
    </button>
  );

  return (
    <>
      <aside className="hidden md:flex flex-col gap-8 mt-12">
        <div className="rounded-xl bg-card p-4 shadow-card min-w-[275px]">
          <div className="mb-4 flex items-start justify-between">
            <h2 className="text-xl leading-5">Ваша корзина</h2>
            <span className="text-sm leading-5 text-muted-foreground">{itemsLabel}</span>
          </div>
          <div className="mb-4 flex items-end justify-between">
            <span className="text-xs leading-4 text-muted-foreground">сумма заказа</span>
            <span className="text-[30px] leading-9 font-bold text-success">{rubleCurrency.format(totalPrice)}</span>
          </div>
          {checkoutButton('h-10 w-full cursor-pointer rounded-md bg-primary px-4 text-base leading-6 font-bold text-white disabled:bg-muted disabled:text-muted-foreground')}
        </div>
        <img src={shoppingImage} alt="" className="h-[418px] w-[440px] object-cover" />
      </aside>

      <div className="fixed right-0 bottom-[58px] left-0 rounded-t-xl border border-border bg-card px-5 py-4 md:hidden">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-xl leading-5 font-bold text-success">{rubleCurrency.format(totalPrice)}</span>
          <span className="text-sm leading-5 text-muted-foreground">{itemsLabel}</span>
        </div>
        {checkoutButton('h-9 w-full cursor-pointer rounded-md bg-primary px-4 text-sm leading-5 font-bold text-white disabled:bg-muted disabled:text-muted-foreground')}
      </div>
    </>
  );
}
