import { useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { rubleCurrency } from '@/lib/format';
import { useGetOrderByIdQuery } from '@/store/api';

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') ?? '';
  const { data: order, isError, isLoading } = useGetOrderByIdQuery(orderId, {
    skip: !orderId,
  });
  const printRef = useRef<HTMLElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  if (isLoading) {
    return (
      <section className="pb-28 md:mx-auto md:w-[780px] md:pt-2">
        <p className="text-sm leading-5 text-muted-foreground md:text-base md:leading-6">Загружаем заказ...</p>
      </section>
    );
  }

  if (!orderId || isError || !order) {
    return (
      <section className="pb-28 md:mx-auto md:w-[780px] md:pt-2">
        <h1 className="mb-4 text-2xl leading-8 md:text-[30px] md:leading-9">Заказ не найден</h1>
        <Link className="cursor-pointer text-sm leading-5 text-primary-hover md:text-base md:leading-6" to="/profile/orders">
          Все заказы
        </Link>
      </section>
    );
  }

  const deliveryTitle = order.deliveryMethod === 'pickup_point' ? 'Пункт выдачи' : 'Адрес доставки';
  const deliveryAddress = order.deliveryMethod === 'pickup_point'
    ? order.pickupPoint?.address ?? 'Адрес пункта выдачи'
    : [order.deliveryAddress?.city, order.deliveryAddress?.street]
        .filter(Boolean)
        .join(', ');
  const paymentMethod = order.payment?.method ?? order.paymentMethod;
  const paymentTitle = paymentMethod === 'card_online' ? 'Оплачено картой' : 'Способ оплаты';
  const paymentValue = paymentMethod === 'card_online'
    ? order.payment?.cardLast4 ? `*${order.payment.cardLast4}` : 'Картой'
    : 'Наличными при получении';

  return (
    <section ref={printRef} className="pb-28 md:mx-auto md:w-[780px] md:pt-2">
      <h1 className="mb-2 hidden text-[30px] leading-9 md:block">Спасибо за покупку!</h1>
      <h1 className="mb-4 text-2xl leading-8 md:hidden">Спасибо за заказ!</h1>
      <p className="mb-5 hidden text-xl leading-5 font-bold md:block">Мы уже готовим выбранные усы к отправке!</p>

      <article className="rounded-xl bg-card p-6 shadow-card md:p-6">
        <section>
          <h2 className="mb-4 text-sm leading-5 font-bold md:text-base md:leading-6">Получатель</h2>
          <div className="grid gap-3 md:flex md:gap-6">
            <p className="text-sm leading-5 md:text-base md:leading-6">{order.customer.firstName} {order.customer.lastName}</p>
            <p className="text-xs leading-4 text-muted-foreground md:text-sm md:leading-5">{order.customer.email}</p>
            <p className="text-xs leading-4 text-muted-foreground md:text-sm md:leading-5">{order.customer.phone}</p>
          </div>
          {order.comment ? (
            <p className="mt-4 text-xs leading-4 md:max-w-[470px] md:text-sm md:leading-5">
              {order.comment}
            </p>
          ) : null}
        </section>

        <Divider />

        <section className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs leading-4 text-[#9ca3af] md:text-sm md:leading-5">{deliveryTitle}</p>
            <p className="text-sm leading-5 md:text-base md:leading-6">{deliveryAddress}</p>
          </div>
          <div>
            <p className="text-xs leading-4 text-[#9ca3af] md:text-sm md:leading-5">
              {order.deliveryMethod === 'pickup_point' ? 'Забирать после' : 'Доставят'}
            </p>
            <p className="text-sm leading-5 md:text-base md:leading-6">30 февраля 2025 г.</p>
          </div>
        </section>

        <Divider />

        <section className="grid gap-6 md:grid-cols-2 md:gap-16">
          {order.items.map((product) => (
            <div className="grid grid-cols-[60px_1fr_auto] items-center gap-4 md:grid-cols-[72px_1fr]" key={product.productId}>
              <img alt="" className="h-[60px] w-[60px] object-contain md:h-10 md:w-[72px]" src={product.image} />
              <div>
                <p className="text-sm leading-5 text-primary-hover md:text-base md:leading-6">{product.name}</p>
                <p className="text-xs leading-4 text-[#9ca3af] md:hidden">{product.quantity} шт.</p>
                <p className="hidden text-xl leading-5 font-bold md:block">
                  {rubleCurrency.format(product.price * product.quantity)} <span className="text-base leading-6 font-normal text-muted-foreground">{product.quantity} шт.</span>
                </p>
              </div>
              <p className="text-sm leading-5 font-bold md:hidden">{rubleCurrency.format(product.price * product.quantity)}</p>
            </div>
          ))}
        </section>

        <Divider />

        <section className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs leading-4 text-[#9ca3af] md:text-sm md:leading-5">{paymentTitle}</p>
            <p className="text-xl leading-5 font-bold">{paymentValue}</p>
          </div>
          <div className="text-right md:text-left">
            <p className="text-xs leading-4 text-[#9ca3af] md:text-sm md:leading-5">Общая сумма</p>
            <p className="text-xl leading-5 font-bold md:text-[30px] md:leading-9">{rubleCurrency.format(order.totalPrice)}</p>
          </div>
        </section>
      </article>

      <div className="mt-6 grid gap-6 md:flex md:items-center md:justify-between">
        <button
          className="h-9 cursor-pointer rounded-md border border-primary bg-card px-4 text-sm leading-5 font-bold text-primary md:w-[135px] md:bg-primary md:text-base md:leading-6 md:text-white"
          onClick={() => handlePrint()}
          type="button"
        >
          Распечатать заказ
        </button>
        <Link className="cursor-pointer text-center text-sm leading-5 text-primary-hover md:text-base md:leading-6" to="/profile/orders">
          <span className="md:hidden">История заказов</span>
          <span className="hidden md:inline">Все заказы</span>
        </Link>
      </div>

      <div className="fixed right-0 bottom-[58px] left-0 rounded-t-xl border border-border bg-card px-5 py-4 md:hidden">
        <Link className="flex h-9 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm leading-5 font-bold text-white" to="/">
          Вернуться к покупкам
        </Link>
      </div>
    </section>
  );
}

function Divider() {
  return <div className="my-6 border-t border-[#9ca3af] md:border-border" />;
}
