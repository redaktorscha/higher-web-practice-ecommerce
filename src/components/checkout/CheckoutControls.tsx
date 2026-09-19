import type { ReactNode } from 'react';
import { formatItemCount, rubleCurrency } from '@/lib/format';

export function CheckoutBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h1 className="mb-4 text-2xl leading-8 md:hidden">{title}</h1>
      <div className="rounded-xl bg-card p-6 shadow-card md:p-4">
        <h2 className="mb-4 hidden text-xl leading-5 md:block">{title}</h2>
        {children}
      </div>
    </section>
  );
}

export function CheckoutChoice({ active, centered, className, children, onClick }: {
  active?: boolean;
  centered?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      className={[
        'flex h-10 items-center rounded-md px-4 text-base leading-6 outline-none',
        'cursor-pointer',
        centered ? 'justify-center' : 'justify-start',
        active ? 'border border-primary bg-muted text-primary-hover' : 'border border-transparent bg-muted text-foreground md:border-muted-foreground md:bg-card',
        className,
      ].filter(Boolean).join(' ')}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export function OrderSummary({ deliveryPrice, formMessage, isLoading, itemsCount, onPayment, subtotal, total }: {
  deliveryPrice: number;
  formMessage: string;
  isLoading: boolean;
  itemsCount: number;
  onPayment: () => void;
  subtotal: number;
  total: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card md:border-0 md:p-4">
      <div className="mb-6 flex items-center justify-between md:mb-4">
        <h2 className="text-xl leading-5">Ваш заказ</h2>
        <span className="text-sm leading-5 text-muted-foreground">{formatItemCount(itemsCount)}</span>
      </div>
      <div className="grid gap-4 text-base leading-6 md:gap-4">
        <div className="flex justify-between">
          <span className="text-[#9ca3af] md:text-muted-foreground">Сумма заказа</span>
          <span className="font-bold">{rubleCurrency.format(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9ca3af] md:text-muted-foreground">Стоимость доставки</span>
          <span className="font-bold text-success">{deliveryPrice === 0 ? 'бесплатно' : rubleCurrency.format(deliveryPrice)}</span>
        </div>
        <div className="border-t border-[#9ca3af] pt-4 md:border-border">
          <div className="flex justify-between">
            <span className="text-[#9ca3af] md:text-foreground">Итого</span>
            <span className="text-xl leading-5 font-bold text-success md:text-[30px] md:leading-9">{rubleCurrency.format(total)}</span>
          </div>
        </div>
      </div>
      {formMessage ? <p className="mt-3 text-sm leading-5 text-danger">{formMessage}</p> : null}
      <button
        className="mt-4 h-9 w-full cursor-pointer rounded-md bg-primary px-4 text-sm leading-5 font-bold text-white disabled:bg-muted disabled:text-muted-foreground md:h-10 md:text-base md:leading-6"
        disabled={isLoading}
        onClick={onPayment}
        type="button"
      >
        {isLoading ? 'Оплачиваем...' : 'Оплатить'}
      </button>
    </div>
  );
}
