import { ChevronDown, Plus, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import orderImage from '@/assets/order.png';
import { checkoutSchema, getFieldErrors, paymentCardSchema, type PaymentCardFormValues } from '@/lib/validation';
import { useCreateOrderMutation, useGetPickupPointsQuery } from '@/store/api';
import { selectCurrentUser } from '@/store/authSlice';
import { selectCart } from '@/store/cartSlice';
import {
  addSavedCard,
  resetOrderDraft,
  selectOrderDraft,
  selectSavedCard,
  setAddress,
  setCity,
  setComment,
  setDeliveryMethod,
  setPaymentMethod,
  setPhone,
  setPickupPoint,
  setSavedCards,
  type CheckoutCity,
  type SavedPaymentCard,
} from '@/store/orderSlice';
import type { PickupPoint } from '@/types';

type CheckoutErrors = Partial<Record<'selectedCardId' | 'city' | 'address' | 'pickupPointId' | 'phone', string>>;
type CardFocus = 'name' | 'number' | 'expiry' | 'cvc' | '';

const fieldClassName =
  'h-10 rounded-sm border border-[#9ca3af] bg-card px-3 text-sm leading-5 outline-none placeholder:text-[#9ca3af] md:text-base md:leading-6';
const errorFieldClassName = 'border-danger focus:border-danger';
const cities: CheckoutCity[] = ['Москва', 'Санкт-Петербург'];
const FREE_DELIVERY_THRESHOLD = 5000;
const DELIVERY_PRICE = 300;

const currency = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

function getCardsStorageKey(userId: string) {
  return `quant:payment-cards:${userId}`;
}

function loadSavedCards(userId: string) {
  try {
    const rawCards = localStorage.getItem(getCardsStorageKey(userId));

    return rawCards ? (JSON.parse(rawCards) as SavedPaymentCard[]) : [];
  } catch {
    return [];
  }
}

function saveCards(userId: string, cards: SavedPaymentCard[]) {
  localStorage.setItem(getCardsStorageKey(userId), JSON.stringify(cards));
}

function getItemsLabel(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} товар`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} товара`;
  }

  return `${count} товаров`;
}

function getDeliveryPrice(cartTotalPrice: number) {
  return cartTotalPrice > FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_PRICE;
}

export function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const cart = useSelector(selectCart);
  const orderDraft = useSelector(selectOrderDraft);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const { data: pickupPoints = [], isFetching: isPickupPointsFetching } = useGetPickupPointsQuery(
    orderDraft.city ? { city: orderDraft.city } : undefined,
    { skip: !orderDraft.city },
  );
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [formMessage, setFormMessage] = useState('');

  const deliveryPrice = getDeliveryPrice(cart.totalPrice);
  const totalPrice = cart.totalPrice + deliveryPrice;
  const selectedCard = orderDraft.savedCards.find((card) => card.id === orderDraft.selectedCardId);

  useEffect(() => {
    if (!user) {
      return;
    }

    dispatch(setSavedCards(loadSavedCards(user.id)));
  }, [dispatch, user]);

  const clearError = (field: keyof CheckoutErrors) => {
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
    setFormMessage('');
  };

  const handlePayment = async () => {
    setErrors({});
    setFormMessage('');

    if (!user) {
      navigate('/login');
      return;
    }

    if (cart.items.length === 0) {
      setFormMessage('Корзина пуста');
      return;
    }

    const validationResult = checkoutSchema.safeParse({
      paymentMethod: orderDraft.paymentMethod,
      selectedCardId: orderDraft.selectedCardId,
      deliveryMethod: orderDraft.deliveryMethod,
      city: orderDraft.city,
      address: orderDraft.address,
      pickupPointId: orderDraft.pickupPoint?.id ?? null,
      phone: orderDraft.phone,
      comment: orderDraft.comment,
    });

    if (!validationResult.success) {
      setErrors(getFieldErrors(validationResult.error));
      return;
    }

    const deliveryAddress = orderDraft.deliveryMethod === 'courier'
      ? {
          country: 'Россия',
          city: orderDraft.city,
          street: orderDraft.address,
          house: '-',
        }
      : undefined;

    try {
      await createOrder({
        phone: orderDraft.phone,
        comment: orderDraft.comment || undefined,
        paymentMethod: orderDraft.paymentMethod,
        deliveryMethod: orderDraft.deliveryMethod,
        deliveryAddress,
        pickupPointId: orderDraft.deliveryMethod === 'pickup_point' ? orderDraft.pickupPoint?.id : undefined,
        userId: user.id,
        items: cart.items.map((item) => ({
          productId: item.productId,
          name: item.product.name,
          image: item.product.images[0],
          price: item.price,
          quantity: item.quantity,
        })),
        totalPrice,
        customer: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: orderDraft.phone,
        },
      }).unwrap();

      dispatch(resetOrderDraft());
      navigate('/success');
    } catch {
      setFormMessage('Не удалось оформить заказ. Попробуйте ещё раз.');
    }
  };

  return (
    <section className="grid gap-8 pb-8 md:mx-auto md:w-[980px] md:grid-cols-[580px_380px] md:gap-5 md:pt-2">
      <div className="grid gap-6 md:gap-6">
        <CheckoutBlock title="Способ оплаты">
          <div className="flex flex-wrap gap-3 md:gap-2">
            {orderDraft.savedCards.map((card) => (
              <Choice
                active={orderDraft.paymentMethod === 'card_online' && orderDraft.selectedCardId === card.id}
                key={card.id}
                onClick={() => {
                  dispatch(selectSavedCard(card.id));
                  clearError('selectedCardId');
                }}
              >
                Карта&nbsp; *{card.last4}
              </Choice>
            ))}
            <Choice className="hidden md:flex" onClick={() => setIsCardModalOpen(true)}>
              Новая карта
              <Plus className="size-6" />
            </Choice>
            <Choice className="md:hidden" onClick={() => setIsCardModalOpen(true)}>Добавить карту</Choice>
            <Choice
              active={orderDraft.paymentMethod === 'cash'}
              onClick={() => {
                dispatch(setPaymentMethod('cash'));
                clearError('selectedCardId');
              }}
            >
              Наличными при получении
            </Choice>
          </div>
          {errors.selectedCardId ? <p className="mt-2 text-xs leading-4 text-danger">{errors.selectedCardId}</p> : null}
        </CheckoutBlock>

        <CheckoutBlock title="Способ доставки">
          <div className="grid gap-6 md:gap-5">
            <div className="grid grid-cols-2 gap-3 md:gap-2">
              <Choice active={orderDraft.deliveryMethod === 'courier'} centered onClick={() => dispatch(setDeliveryMethod('courier'))}>
                Курьером
              </Choice>
              <Choice active={orderDraft.deliveryMethod === 'pickup_point'} centered onClick={() => dispatch(setDeliveryMethod('pickup_point'))}>
                В пункт выдачи
              </Choice>
            </div>

            <p className="text-sm leading-5 text-[#9ca3af] md:hidden">
              Доставят
              <br />
              <span className="text-base leading-6 text-foreground">30 февраля 2025 г.</span>
            </p>

            {orderDraft.deliveryMethod === 'courier' ? (
              <div className="grid gap-2">
                <p className="text-base leading-6">Доставить по адресу:</p>
                <div className="grid gap-2 md:grid-cols-[171px_1fr]">
                  <button
                    className={`${fieldClassName} flex items-center justify-between ${errors.city ? errorFieldClassName : ''}`}
                    onClick={() => setIsCityModalOpen(true)}
                    type="button"
                  >
                    {orderDraft.city || 'Город *'}
                    <ChevronDown className="size-5 text-muted-foreground md:size-4" />
                  </button>
                  <input
                    className={`${fieldClassName} ${errors.address ? errorFieldClassName : ''}`}
                    onChange={(event) => {
                      dispatch(setAddress(event.target.value));
                      clearError('address');
                    }}
                    placeholder="улица, дом, квартира *"
                    value={orderDraft.address}
                  />
                </div>
                {errors.city ? <p className="text-xs leading-4 text-danger">{errors.city}</p> : null}
                {errors.address ? <p className="text-xs leading-4 text-danger">{errors.address}</p> : null}
              </div>
            ) : (
              <div className="grid gap-3">
                <button
                  className={`${fieldClassName} flex items-center justify-between ${errors.city ? errorFieldClassName : ''}`}
                  onClick={() => setIsCityModalOpen(true)}
                  type="button"
                >
                  {orderDraft.city || 'Город *'}
                  <ChevronDown className="size-5 text-muted-foreground md:size-4" />
                </button>
                {errors.city ? <p className="text-xs leading-4 text-danger">{errors.city}</p> : null}
                <div className="grid gap-3 md:grid-cols-[176px_1fr] md:items-center md:gap-2">
                  <button
                    className="order-2 h-10 rounded-md border border-primary bg-card px-4 text-base leading-6 font-bold text-primary md:order-none"
                    onClick={() => setIsPickupModalOpen(true)}
                    type="button"
                  >
                    Выбрать на карте
                  </button>
                  <div>
                    <p className="text-base leading-6">{orderDraft.pickupPoint?.address ?? 'Адрес пункта выдачи'}</p>
                    <p className="text-sm leading-5 text-muted-foreground">время работы</p>
                  </div>
                </div>
                {errors.pickupPointId ? <p className="text-xs leading-4 text-danger">{errors.pickupPointId}</p> : null}
              </div>
            )}

            <p className="hidden text-sm leading-5 text-[#9ca3af] md:block">
              Доставят <span className="pl-2 text-base leading-6 text-foreground">30 февраля 2025 г.</span>
            </p>
          </div>
        </CheckoutBlock>

        <CheckoutBlock title="Получатель">
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-[1fr_216px] md:items-start">
              <div>
                <p className="text-base leading-6">{user ? `${user.firstName} ${user.lastName}` : 'Имя Фамилия'}</p>
                <p className="text-sm leading-5 text-muted-foreground md:mt-3">{user?.email ?? 'Email@yanex.ru'}</p>
              </div>
              <label className="grid gap-1 text-sm leading-5">
                Номер телефона *
                <input
                  className={`${fieldClassName} ${errors.phone ? errorFieldClassName : ''}`}
                  onChange={(event) => {
                    dispatch(setPhone(event.target.value));
                    clearError('phone');
                  }}
                  placeholder="+7"
                  value={orderDraft.phone}
                />
                {errors.phone ? <span className="text-xs leading-4 text-danger">{errors.phone}</span> : null}
              </label>
            </div>

            <label className="grid gap-1 text-sm leading-5">
              Комментарий к заказу
              <textarea
                className="h-[120px] resize-none rounded-sm border border-[#9ca3af] bg-card p-3 outline-none md:h-[120px]"
                onChange={(event) => dispatch(setComment(event.target.value))}
                value={orderDraft.comment}
              />
            </label>
          </div>
        </CheckoutBlock>
      </div>

      <aside className="grid gap-8 self-start md:sticky md:top-24">
        <OrderSummary
          deliveryPrice={deliveryPrice}
          formMessage={formMessage}
          isLoading={isLoading}
          itemsCount={cart.totalItems}
          onPayment={handlePayment}
          selectedCard={selectedCard}
          subtotal={cart.totalPrice}
          total={totalPrice}
        />
        <img alt="" className="hidden h-[396px] w-[420px] object-contain md:block" src={orderImage} />
      </aside>

      {isCardModalOpen && user ? (
        <PaymentCardModal
          onClose={() => setIsCardModalOpen(false)}
          onSave={(card) => {
            const nextCards = [...orderDraft.savedCards, card];
            saveCards(user.id, nextCards);
            dispatch(addSavedCard(card));
            clearError('selectedCardId');
            setIsCardModalOpen(false);
          }}
        />
      ) : null}
      {isCityModalOpen ? (
        <CityModal
          onClose={() => setIsCityModalOpen(false)}
          onSelect={(city) => {
            dispatch(setCity(city));
            clearError('city');
            setIsCityModalOpen(false);
          }}
        />
      ) : null}
      {isPickupModalOpen ? (
        <PickupPointModal
          city={orderDraft.city}
          isLoading={isPickupPointsFetching}
          onClose={() => setIsPickupModalOpen(false)}
          onSelect={(point) => {
            dispatch(setPickupPoint(point));
            clearError('pickupPointId');
            setIsPickupModalOpen(false);
          }}
          points={pickupPoints}
        />
      ) : null}
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
  onClick,
}: {
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
        centered ? 'justify-center' : 'justify-start',
        active ? 'border border-primary bg-muted text-primary-hover' : 'border border-transparent bg-muted text-foreground md:border-muted-foreground md:bg-card',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function OrderSummary({
  deliveryPrice,
  formMessage,
  isLoading,
  itemsCount,
  onPayment,
  subtotal,
  total,
}: {
  deliveryPrice: number;
  formMessage: string;
  isLoading: boolean;
  itemsCount: number;
  onPayment: () => void;
  selectedCard?: SavedPaymentCard;
  subtotal: number;
  total: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card md:border-0 md:p-4">
      <div className="mb-6 flex items-center justify-between md:mb-4">
        <h2 className="text-xl leading-5">Ваш заказ</h2>
        <span className="text-sm leading-5 text-muted-foreground">{getItemsLabel(itemsCount)}</span>
      </div>
      <div className="grid gap-4 text-base leading-6 md:gap-4">
        <div className="flex justify-between">
          <span className="text-[#9ca3af] md:text-muted-foreground">Сумма заказа</span>
          <span className="font-bold">{currency.format(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9ca3af] md:text-muted-foreground">Стоимость доставки</span>
          <span className="font-bold text-success">{deliveryPrice === 0 ? 'бесплатно' : currency.format(deliveryPrice)}</span>
        </div>
        <div className="border-t border-[#9ca3af] pt-4 md:border-border">
          <div className="flex justify-between">
            <span className="text-[#9ca3af] md:text-foreground">Итого</span>
            <span className="text-xl leading-5 font-bold text-success md:text-[30px] md:leading-9">{currency.format(total)}</span>
          </div>
        </div>
      </div>
      {formMessage ? <p className="mt-3 text-sm leading-5 text-danger">{formMessage}</p> : null}
      <button
        className="mt-4 h-9 w-full rounded-md bg-primary px-4 text-sm leading-5 font-bold text-white disabled:bg-muted disabled:text-muted-foreground md:h-10 md:text-base md:leading-6"
        disabled={isLoading}
        onClick={onPayment}
        type="button"
      >
        {isLoading ? 'Оплачиваем...' : 'Оплатить'}
      </button>
    </div>
  );
}

function PaymentCardModal({ onClose, onSave }: { onClose: () => void; onSave: (card: SavedPaymentCard) => void }) {
  const [values, setValues] = useState<PaymentCardFormValues>({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  });
  const [focused, setFocused] = useState<CardFocus>('');
  const [errors, setErrors] = useState<Partial<Record<keyof PaymentCardFormValues, string>>>({});

  const changeValue = (field: keyof PaymentCardFormValues, value: string) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: field === 'name' ? value : value.replace(/[^\d/]/g, ''),
    }));
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const saveCard = () => {
    const normalizedValues = {
      ...values,
      number: values.number.replace(/\D/g, ''),
      cvc: values.cvc.replace(/\D/g, ''),
    };
    const validationResult = paymentCardSchema.safeParse(normalizedValues);

    if (!validationResult.success) {
      setErrors(getFieldErrors(validationResult.error));
      return;
    }

    onSave({
      id: crypto.randomUUID(),
      last4: validationResult.data.number.slice(-4),
      holderName: validationResult.data.name,
      expiry: validationResult.data.expiry,
    });
  };

  return (
    <Modal title="Новая карта" onClose={onClose}>
      <div className="grid gap-4">
        <Cards
          cvc={values.cvc}
          expiry={values.expiry}
          focused={focused}
          name={values.name}
          number={values.number}
        />
        <label className="grid gap-1 text-sm leading-5">
          Номер карты *
          <input
            className={`${fieldClassName} ${errors.number ? errorFieldClassName : ''}`}
            maxLength={16}
            onChange={(event) => changeValue('number', event.target.value)}
            onFocus={() => setFocused('number')}
            placeholder="0000000000000000"
            value={values.number}
          />
          {errors.number ? <span className="text-xs leading-4 text-danger">{errors.number}</span> : null}
        </label>
        <label className="grid gap-1 text-sm leading-5">
          Имя владельца *
          <input
            className={`${fieldClassName} ${errors.name ? errorFieldClassName : ''}`}
            onChange={(event) => changeValue('name', event.target.value)}
            onFocus={() => setFocused('name')}
            placeholder="IVAN PETROV"
            value={values.name}
          />
          {errors.name ? <span className="text-xs leading-4 text-danger">{errors.name}</span> : null}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm leading-5">
            Срок *
            <input
              className={`${fieldClassName} ${errors.expiry ? errorFieldClassName : ''}`}
              maxLength={5}
              onChange={(event) => changeValue('expiry', event.target.value)}
              onFocus={() => setFocused('expiry')}
              placeholder="MM/YY"
              value={values.expiry}
            />
            {errors.expiry ? <span className="text-xs leading-4 text-danger">{errors.expiry}</span> : null}
          </label>
          <label className="grid gap-1 text-sm leading-5">
            CVC *
            <input
              className={`${fieldClassName} ${errors.cvc ? errorFieldClassName : ''}`}
              maxLength={4}
              onChange={(event) => changeValue('cvc', event.target.value)}
              onFocus={() => setFocused('cvc')}
              placeholder="123"
              value={values.cvc}
            />
            {errors.cvc ? <span className="text-xs leading-4 text-danger">{errors.cvc}</span> : null}
          </label>
        </div>
        <button className="h-10 rounded-md bg-primary px-4 text-base leading-6 font-bold text-white" onClick={saveCard} type="button">
          Сохранить карту
        </button>
      </div>
    </Modal>
  );
}

function CityModal({ onClose, onSelect }: { onClose: () => void; onSelect: (city: CheckoutCity) => void }) {
  return (
    <Modal title="Выберите город" onClose={onClose}>
      <div className="grid gap-2">
        {cities.map((city) => (
          <button
            className="h-10 rounded-md border border-muted-foreground bg-card px-4 text-left text-base leading-6 hover:border-primary hover:text-primary"
            key={city}
            onClick={() => onSelect(city)}
            type="button"
          >
            {city}
          </button>
        ))}
      </div>
    </Modal>
  );
}

function PickupPointModal({
  city,
  isLoading,
  onClose,
  onSelect,
  points,
}: {
  city: CheckoutCity | '';
  isLoading: boolean;
  onClose: () => void;
  onSelect: (point: PickupPoint) => void;
  points: PickupPoint[];
}) {
  return (
    <Modal title="Пункт выдачи" onClose={onClose}>
      {!city ? (
        <p className="text-sm leading-5 text-muted-foreground">Сначала выберите город.</p>
      ) : isLoading ? (
        <p className="text-sm leading-5 text-muted-foreground">Загружаем пункты выдачи...</p>
      ) : points.length > 0 ? (
        <div className="grid gap-2">
          {points.map((point) => (
            <button
              className="rounded-md border border-muted-foreground bg-card p-3 text-left hover:border-primary hover:text-primary"
              key={point.id}
              onClick={() => onSelect(point)}
              type="button"
            >
              <span className="block text-base leading-6">{point.name}</span>
              <span className="block text-sm leading-5 text-muted-foreground">{point.address}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm leading-5 text-muted-foreground">В выбранном городе пока нет пунктов выдачи.</p>
      )}
    </Modal>
  );
}

function Modal({ children, onClose, title }: { children: ReactNode; onClose: () => void; title: string }) {
  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-5">
      <div className="w-full max-w-[420px] rounded-xl bg-card p-6 shadow-modal">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl leading-5">{title}</h2>
          <button className="grid size-8 place-items-center text-muted-foreground" onClick={onClose} type="button" aria-label="Закрыть">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
