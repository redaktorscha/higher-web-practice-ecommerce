import { Trash } from 'lucide-react';
import shoppingImage from '@/assets/shopping.png';

const cartProducts = [
  { name: 'Инженер', price: '2 650 ₽', image: '/mustashes/enginere/0.png' },
  { name: 'Председатель', price: '5 590 ₽', image: '/mustashes/chairman/0.png' },
];

export function CartPage() {
  return (
    <section className="md:grid md:grid-cols-[580px_280px] md:gap-5">
      <div>
        <div className="mb-8 flex items-end gap-4 md:mb-4">
          <h1 className="text-2xl leading-8">Корзина</h1>
          <span className="pb-1 text-sm leading-5 text-muted-foreground md:hidden">2 товара</span>
        </div>

        <div className="grid gap-8 md:gap-4">
          {cartProducts.map((product, index) => (
            <article key={product.name}>
              <div className="grid grid-cols-[60px_1fr_auto] gap-x-4 md:h-28 md:grid-cols-[72px_1fr_104px_86px_24px] md:items-center md:gap-8 md:rounded-xl md:bg-card md:p-4 md:shadow-card">
                <img alt="" className="h-[60px] w-[60px] rounded-lg bg-card object-contain md:h-10 md:w-[72px] md:rounded-none md:bg-transparent" src={product.image} />
                <div className="grid content-start gap-8 md:block">
                  <p className="text-sm leading-5 text-primary-hover md:text-base md:leading-6">{product.name}</p>
                  <div className="md:hidden">
                    <Quantity />
                  </div>
                </div>
                <div className="grid justify-items-end gap-8 md:hidden">
                  <p className="text-sm leading-5 font-bold">{product.price}</p>
                  <button className="text-primary md:hidden" type="button" aria-label="Удалить">
                    <Trash className="size-9" />
                  </button>
                </div>
                <div className="col-span-3 mt-6 md:hidden">
                  <p className="text-sm leading-5 text-[#9ca3af]">Доставят</p>
                  <p className="text-sm leading-5">30 февраля 2025 г.</p>
                </div>
                <div className="hidden md:block">
                  <Quantity />
                </div>
                <p className="hidden text-2xl leading-8 font-bold md:block">{product.price}</p>
                <button className="hidden text-primary md:block" type="button" aria-label="Удалить">
                  <Trash className="size-6" />
                </button>
              </div>
              {index < cartProducts.length - 1 ? <div className="mt-8 border-t border-border md:hidden" /> : null}
            </article>
          ))}
        </div>
      </div>

      <aside className="hidden md:block">
        <div className="rounded-xl bg-card p-4 shadow-card">
          <div className="mb-4 flex items-start justify-between">
            <h2 className="text-xl leading-5">Ваша корзина</h2>
            <span className="text-sm leading-5 text-muted-foreground">2 товара</span>
          </div>
          <div className="mb-4 flex items-end justify-between">
            <span className="text-xs leading-4 text-muted-foreground">сумма заказа</span>
            <span className="text-[30px] leading-9 font-bold text-success">8 280 ₽</span>
          </div>
          <button className="h-10 w-full rounded-md bg-primary px-4 text-base leading-6 font-bold text-white" type="button">
            Оформить заказ
          </button>
        </div>
        <img alt="" className="mt-12 h-[396px] w-[288px] object-contain" src={shoppingImage} />
      </aside>

      <div className="fixed right-0 bottom-[58px] left-0 rounded-t-xl border border-border bg-card px-5 py-4 md:hidden">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-xl leading-5 font-bold text-success">8 280 ₽</span>
          <span className="text-sm leading-5 text-muted-foreground">2 товара</span>
        </div>
        <button className="h-9 w-full rounded-md bg-primary px-4 text-sm leading-5 font-bold text-white" type="button">
          Оформить заказ
        </button>
      </div>
    </section>
  );
}

function Quantity() {
  return (
    <div className="flex items-center gap-4 md:gap-3">
      <button className="grid size-8 place-items-center rounded-md bg-border text-sm leading-5" type="button">
        -
      </button>
      <span className="text-2xl leading-8 font-bold">1</span>
      <button className="grid size-8 place-items-center rounded-md bg-border text-sm leading-5" type="button">
        +
      </button>
    </div>
  );
}
