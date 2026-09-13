import * as Collapsible from '@radix-ui/react-collapsible';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetOrdersQuery } from '@/store/api';
import { selectCurrentUser } from '@/store/authSlice';
import type { Order, OrderItem } from '@/types';

const currency = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

function formatOrderDate(date: string) {
  return `от ${dateFormatter.format(new Date(date))}`;
}

function getOrderNumber(number: string) {
  const digits = number.replace(/\D/g, '');
  const shortNumber = digits.slice(-4).padStart(4, '0');

  return `№ ${shortNumber}`;
}

function getStatusText(status: Order['status']) {
  switch (status) {
    case 'delivered':
      return 'Получен';
    case 'paid':
      return 'Оплачен';
    case 'processing':
      return 'В обработке';
    case 'shipped':
      return 'Отправлен';
    case 'cancelled':
      return 'Отменён';
    default:
      return 'Ожидает оплаты';
  }
}

function getDeliveryText(order: Order) {
  return order.deliveryMethod === 'pickup_point' ? 'в пункте выдачи' : 'курьером';
}

function getPaymentText(order: Order) {
  return order.paymentMethod === 'cash' ? 'Наличными при получении' : 'Оплачено картой';
}

export function OrderHistoryPage() {
  const user = useSelector(selectCurrentUser);
  const { data: orders = [], isError, isLoading, refetch } = useGetOrdersQuery(
    user ? { userId: user.id } : undefined,
    { skip: !user },
  );

  return (
    <section>
      <h1 className="mb-4 text-2xl leading-8">История заказов</h1>

      <div className="grid gap-8 md:w-[580px] md:gap-4">
        {isLoading ? (
          <div className="rounded-xl bg-card p-4 text-sm leading-5 text-muted-foreground shadow-card">Загружаем заказы...</div>
        ) : isError ? (
          <div className="rounded-xl bg-card p-4 text-sm leading-5 text-muted-foreground shadow-card">
            Не удалось загрузить заказы.
            <button className="ml-2 text-primary-hover" onClick={() => refetch()} type="button">
              Повторить
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl bg-card p-4 text-sm leading-5 text-muted-foreground shadow-card">У вас еще нет заказов</div>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </section>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible.Root asChild open={isOpen} onOpenChange={setIsOpen}>
      <article className="rounded-xl bg-card p-4 shadow-card">
        <OrderHeader order={order} />
        <div className="my-4 border-t border-border" />
        <Collapsible.Content>
          <div className="grid gap-0">
            {order.items.map((product, index) => (
              <OrderProduct key={`${order.id}-${product.productId}`} product={product} showDivider={index < order.items.length - 1} />
            ))}
          </div>
          <div className="my-4 border-t border-border" />
        </Collapsible.Content>
        <Collapsible.Trigger asChild>
          <button className="w-full text-center text-base leading-6 text-primary-hover" type="button">
            {isOpen ? 'Свернуть товары ↑' : 'Показать товары в заказе ↓'}
          </button>
        </Collapsible.Trigger>
      </article>
    </Collapsible.Root>
  );
}

function OrderHeader({ order }: { order: Order }) {
  return (
    <div className="grid gap-5 md:grid-cols-[1fr_auto] md:gap-1">
      <div className="grid grid-cols-[1fr_auto] gap-4 md:block">
        <p className="text-xl leading-7 font-bold md:inline md:leading-5">{formatOrderDate(order.createdAt)}</p>
        <p className="text-base leading-6 md:inline md:pl-2">{getOrderNumber(order.number)}</p>
        <p className="col-span-2 mt-2 text-base leading-6 md:mt-3">
          <span className="font-bold text-success">{getStatusText(order.status)}</span>
          <span className="pl-2 text-sm leading-5 text-[#9ca3af]">{getDeliveryText(order)}</span>
        </p>
        <p className="col-span-2 text-sm leading-5 text-[#9ca3af] md:hidden">{getPaymentText(order)}</p>
      </div>
      <div className="md:text-right">
        <p className="text-right text-2xl leading-8 font-bold">{currency.format(order.totalPrice)}</p>
        <p className="hidden text-xs leading-4 text-muted-foreground md:block">{getPaymentText(order)}</p>
      </div>
    </div>
  );
}

function OrderProduct({ product, showDivider }: { product: OrderItem; showDivider: boolean }) {
  return (
    <div>
      <div className="grid grid-cols-[72px_1fr_auto] items-center gap-4 py-4">
        <img alt="" className="h-10 w-[72px] object-contain" src={product.image} />
        <div>
          <p className="text-base leading-6 text-primary-hover">{product.name}</p>
        </div>
        <p className="text-base leading-6 md:font-normal">{currency.format(product.price * product.quantity)}</p>
      </div>
      {showDivider ? <div className="border-t border-border" /> : null}
    </div>
  );
}
