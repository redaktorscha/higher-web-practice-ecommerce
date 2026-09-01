import { Link } from 'react-router-dom';

const products = [
  { name: 'Инженер', price: '2 650 ₽', desktopPrice: '10 000 ₽', image: '/mustashes/enginere/0.png' },
  { name: 'Председатель', price: '5 590 ₽', desktopPrice: '10 000 ₽', image: '/mustashes/chairman/0.png' },
];

export function SuccessPage() {
  return (
    <section className="pb-28 md:mx-auto md:w-[780px] md:pt-2">
      <h1 className="mb-2 hidden text-[30px] leading-9 md:block">Спасибо за покупку!</h1>
      <h1 className="mb-4 text-2xl leading-8 md:hidden">Спасибо за заказ!</h1>
      <p className="mb-5 hidden text-xl leading-5 font-bold md:block">Мы уже готовим выбранные усы к отправке!</p>

      <article className="rounded-xl bg-card p-6 shadow-card md:p-6">
        <section>
          <h2 className="mb-4 text-sm leading-5 font-bold md:text-base md:leading-6">Получатель</h2>
          <div className="grid gap-3 md:flex md:gap-6">
            <p className="text-sm leading-5 md:text-base md:leading-6">Ярополк Иванов</p>
            <p className="text-xs leading-4 text-muted-foreground md:text-sm md:leading-5">ivanov@yandex.ru</p>
            <p className="text-xs leading-4 text-muted-foreground md:text-sm md:leading-5">+7 444 893-33-44</p>
          </div>
          <p className="mt-4 text-xs leading-4 md:max-w-[470px] md:text-sm md:leading-5">
            Если в комплекте есть инструкция «как выглядеть уверенно», буду благодарен.
          </p>
        </section>

        <Divider />

        <section className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs leading-4 text-[#9ca3af] md:text-sm md:leading-5">Пункт выдачи</p>
            <p className="text-sm leading-5 md:text-base md:leading-6">Адрес пункта выдачи</p>
          </div>
          <div>
            <p className="text-xs leading-4 text-[#9ca3af] md:text-sm md:leading-5">Забирать после</p>
            <p className="text-sm leading-5 md:text-base md:leading-6">30 февраля 2025 г.</p>
          </div>
        </section>

        <Divider />

        <section className="grid gap-6 md:grid-cols-2 md:gap-16">
          {products.map((product) => (
            <div className="grid grid-cols-[60px_1fr_auto] items-center gap-4 md:grid-cols-[72px_1fr]" key={product.name}>
              <img alt="" className="h-[60px] w-[60px] object-contain md:h-10 md:w-[72px]" src={product.image} />
              <div>
                <p className="text-sm leading-5 text-primary-hover md:text-base md:leading-6">{product.name}</p>
                <p className="text-xs leading-4 text-[#9ca3af] md:hidden">Параметр 1</p>
                <p className="hidden text-xl leading-5 font-bold md:block">
                  {product.desktopPrice} <span className="text-base leading-6 font-normal text-muted-foreground">1 шт.</span>
                </p>
              </div>
              <p className="text-sm leading-5 font-bold md:hidden">{product.price}</p>
            </div>
          ))}
        </section>

        <Divider />

        <section className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs leading-4 text-[#9ca3af] md:text-sm md:leading-5">Оплачено картой</p>
            <p className="text-xl leading-5 font-bold">*43 54</p>
          </div>
          <div className="text-right md:text-left">
            <p className="text-xs leading-4 text-[#9ca3af] md:text-sm md:leading-5">Общая сумма</p>
            <p className="text-xl leading-5 font-bold md:text-[30px] md:leading-9">8 280 ₽</p>
          </div>
        </section>
      </article>

      <div className="mt-6 grid gap-6 md:flex md:items-center md:justify-between">
        <button className="h-9 rounded-md border border-primary bg-card px-4 text-sm leading-5 font-bold text-primary md:w-[135px] md:bg-primary md:text-base md:leading-6 md:text-white" type="button">
          Распечатать заказ
        </button>
        <Link className="text-center text-sm leading-5 text-primary-hover md:text-base md:leading-6" to="/profile/orders">
          <span className="md:hidden">История заказов</span>
          <span className="hidden md:inline">Все заказы</span>
        </Link>
      </div>

      <div className="fixed right-0 bottom-[58px] left-0 rounded-t-xl border border-border bg-card px-5 py-4 md:hidden">
        <Link className="flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm leading-5 font-bold text-white" to="/catalog">
          Вернуться к покупкам
        </Link>
      </div>
    </section>
  );
}

function Divider() {
  return <div className="my-6 border-t border-[#9ca3af] md:border-border" />;
}
