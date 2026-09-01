const orderProducts = [
  { name: 'Инженер', price: '590 ₽', image: '/mustashes/enginere/0.png' },
  { name: 'Император', price: '3 490 ₽', image: '/mustashes/emperor/0.png' },
];

export function OrderHistoryPage() {
  return (
    <section>
      <h1 className="mb-4 text-2xl leading-8">История заказов</h1>

      <div className="grid gap-8 md:w-[580px] md:gap-4">
        <article className="rounded-xl bg-card p-4 shadow-card">
          <OrderHeader date="от 01 февраля 2026" number="№ 0032" price="15 000 ₽" />
          <div className="my-4 border-t border-border" />
          <button className="w-full text-center text-base leading-6 text-primary-hover" type="button">
            Показать товары в заказе ↓
          </button>
        </article>

        <article className="rounded-xl bg-card p-4 shadow-card">
          <OrderHeader date="от 01 февраля 2025" number="№ 0031" price="15 000 ₽" />
          <div className="my-4 border-t border-border" />
          <div className="grid gap-0">
            {orderProducts.map((product, index) => (
              <div key={product.name}>
                <div className="grid grid-cols-[72px_1fr_auto] items-center gap-4 py-4">
                  <img alt="" className="h-10 w-[72px] object-contain" src={product.image} />
                  <div>
                    <p className="text-base leading-6 text-primary-hover">{product.name}</p>
                    <p className="text-xs leading-4 text-[#9ca3af]">Параметр 1</p>
                  </div>
                  <p className="text-base leading-6 md:font-normal">{product.price}</p>
                </div>
                {index < orderProducts.length - 1 ? <div className="border-t border-border" /> : null}
              </div>
            ))}
          </div>
          <div className="my-4 border-t border-border" />
          <button className="w-full text-center text-base leading-6 text-primary-hover" type="button">
            Свернуть товары ↑
          </button>
        </article>
      </div>
    </section>
  );
}

function OrderHeader({ date, number, price }: { date: string; number: string; price: string }) {
  return (
    <div className="grid gap-5 md:grid-cols-[1fr_auto] md:gap-1">
      <div className="grid grid-cols-[1fr_auto] gap-4 md:block">
        <p className="text-xl leading-7 font-bold md:inline md:leading-5">{date}</p>
        <p className="text-base leading-6 md:inline md:pl-2">{number}</p>
        <p className="col-span-2 mt-2 text-base leading-6 md:mt-3">
          <span className="font-bold text-success">Получен</span>
          <span className="pl-2 text-sm leading-5 text-[#9ca3af]">в пункте выдачи</span>
        </p>
        <p className="col-span-2 text-sm leading-5 text-[#9ca3af] md:hidden">Оплачено картой</p>
      </div>
      <div className="md:text-right">
        <p className="text-right text-2xl leading-8 font-bold">{price}</p>
        <p className="hidden text-xs leading-4 text-muted-foreground md:block">Оплачено картой</p>
      </div>
    </div>
  );
}
