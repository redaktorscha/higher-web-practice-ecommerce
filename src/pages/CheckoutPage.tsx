import { ChevronDown, Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import orderImage from '@/assets/order.png';

const fieldClassName =
  'h-10 rounded-sm border border-[#9ca3af] bg-card px-3 text-sm leading-5 outline-none placeholder:text-[#9ca3af] md:text-base md:leading-6';

export function CheckoutPage() {
  return (
    <section className="grid gap-8 pb-8 md:mx-auto md:w-[980px] md:grid-cols-[580px_380px] md:gap-5 md:pt-2">
      <div className="grid gap-6 md:gap-6">
        <CheckoutBlock title="Способ оплаты">
          <div className="flex flex-wrap gap-3 md:gap-2">
            <Choice>Карта&nbsp; *43 54</Choice>
            <Choice active>Карта&nbsp; *43 54</Choice>
            <Choice className="hidden md:flex">
              Новая карта
              <Plus className="size-6" />
            </Choice>
            <Choice className="md:hidden">Добавить карту</Choice>
            <Choice>Наличными при получении</Choice>
          </div>
        </CheckoutBlock>

        <CheckoutBlock title="Способ доставки">
          <div className="grid gap-6 md:gap-5">
            <div className="grid grid-cols-2 gap-3 md:gap-2">
              <Choice active centered>Курьером</Choice>
              <Choice centered>В пункт выдачи</Choice>
            </div>

            <p className="text-sm leading-5 text-[#9ca3af] md:hidden">
              Доставят
              <br />
              <span className="text-base leading-6 text-foreground">30 февраля 2025 г.</span>
            </p>

            <div className="grid gap-2">
              <p className="text-base leading-6">Доставить по адресу:</p>
              <div className="grid gap-2 md:grid-cols-[171px_1fr]">
                <button className={`${fieldClassName} flex items-center justify-between`} type="button">
                  Город
                  <ChevronDown className="size-5 text-muted-foreground md:size-4" />
                </button>
                <input className={fieldClassName} placeholder="улица, дом, квартира" />
              </div>
            </div>

            <p className="hidden text-sm leading-5 text-[#9ca3af] md:block">
              Доставят <span className="pl-2 text-base leading-6 text-foreground">30 февраля 2025 г.</span>
            </p>
          </div>
        </CheckoutBlock>

        <CheckoutBlock title="Способ доставки">
          <div className="grid gap-6 md:gap-5">
            <div className="grid grid-cols-2 gap-3 md:gap-2">
              <Choice centered>Курьером</Choice>
              <Choice active centered>В пункт выдачи</Choice>
            </div>

            <p className="text-sm leading-5 text-[#9ca3af] md:hidden">
              Доставят
              <br />
              <span className="text-base leading-6 text-foreground">30 февраля 2026 г.</span>
            </p>

            <div className="grid gap-3 md:grid-cols-[176px_1fr] md:items-center md:gap-2">
              <button className="order-2 h-10 rounded-md border border-primary bg-card px-4 text-base leading-6 font-bold text-primary md:order-none" type="button">
                Выбрать на карте
              </button>
              <div>
                <p className="text-base leading-6">Адрес пункта выдачи</p>
                <p className="text-sm leading-5 text-muted-foreground">время работы</p>
              </div>
            </div>

            <p className="hidden text-sm leading-5 text-[#9ca3af] md:block">
              Доставят <span className="pl-2 text-base leading-6 text-foreground">30 февраля 2025 г.</span>
            </p>
          </div>
        </CheckoutBlock>

        <CheckoutBlock title="Получатель">
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-[1fr_216px] md:items-start">
              <div>
                <p className="text-base leading-6">Имя Фамилия</p>
                <p className="text-sm leading-5 text-muted-foreground md:mt-3">Email@yanex.ru</p>
              </div>
              <label className="grid gap-1 text-sm leading-5">
                Номер телефона
                <input className={fieldClassName} placeholder="+7" />
              </label>
            </div>

            <label className="grid gap-1 text-sm leading-5">
              Комментарий к заказу
              <textarea className="h-[120px] resize-none rounded-sm border border-[#9ca3af] bg-card p-3 outline-none md:h-[120px]" />
            </label>
          </div>
        </CheckoutBlock>
      </div>

      <aside className="grid gap-8 self-start md:sticky md:top-24">
        <OrderSummary />
        <img alt="" className="hidden h-[396px] w-[420px] object-contain md:block" src={orderImage} />
      </aside>
    </section>
  );
}

function CheckoutBlock({ title, children }: { title: string; children: ReactNode }) {
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

function Choice({
  active,
  centered,
  className,
  children,
}: {
  active?: boolean;
  centered?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      className={[
        'flex h-10 items-center rounded-md px-4 text-base leading-6 outline-none',
        centered ? 'justify-center' : 'justify-start',
        active ? 'border border-primary bg-muted text-primary-hover' : 'border border-transparent bg-muted text-foreground md:border-muted-foreground md:bg-card',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      type="button"
    >
      {children}
    </button>
  );
}

function OrderSummary() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card md:border-0 md:p-4">
      <div className="mb-6 flex items-center justify-between md:mb-4">
        <h2 className="text-xl leading-5">Ваш заказ</h2>
        <span className="text-sm leading-5 text-muted-foreground">2 товара</span>
      </div>
      <div className="grid gap-4 text-base leading-6 md:gap-4">
        <div className="flex justify-between">
          <span className="text-[#9ca3af] md:text-muted-foreground">Сумма заказа</span>
          <span className="font-bold">8 280 ₽</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9ca3af] md:text-muted-foreground">Стоимость доставки</span>
          <span className="font-bold text-success">бесплатно</span>
        </div>
        <div className="border-t border-[#9ca3af] pt-4 md:border-border">
          <div className="flex justify-between">
            <span className="text-[#9ca3af] md:text-foreground">Итого</span>
            <span className="text-xl leading-5 font-bold text-success md:text-[30px] md:leading-9">8 280 ₽</span>
          </div>
        </div>
      </div>
      <button className="mt-4 h-9 w-full rounded-md bg-primary px-4 text-sm leading-5 font-bold text-white md:h-10 md:text-base md:leading-6" type="button">
        Оплатить
      </button>
    </div>
  );
}
