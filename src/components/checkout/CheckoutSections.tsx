import { ChevronDown, Plus } from 'lucide-react';
import type { DeliveryMethod, User } from '@/types';
import type { OrderDraft } from '@/store/orderSlice';
import { CheckoutBlock, CheckoutChoice } from './CheckoutControls';
import {
  checkoutErrorFieldClassName,
  checkoutFieldClassName,
  type CheckoutErrors,
} from './checkoutUtils';

export function PaymentSection({ draft, error, onAddCard, onCash, onSelectCard }: {
  draft: OrderDraft;
  error?: string;
  onAddCard: () => void;
  onCash: () => void;
  onSelectCard: (cardId: string) => void;
}) {
  return (
    <CheckoutBlock title="Способ оплаты">
      <div className="flex flex-wrap gap-3 md:gap-2">
        {draft.savedCards.map((card) => (
          <CheckoutChoice
            active={draft.paymentMethod === 'card_online' && draft.selectedCardId === card.id}
            key={card.id}
            onClick={() => onSelectCard(card.id)}
          >
            Карта&nbsp; *{card.last4}
          </CheckoutChoice>
        ))}
        <CheckoutChoice className="hidden md:flex" onClick={onAddCard}>
          Новая карта
          <Plus className="size-6" />
        </CheckoutChoice>
        <CheckoutChoice className="md:hidden" onClick={onAddCard}>Добавить карту</CheckoutChoice>
        <CheckoutChoice active={draft.paymentMethod === 'cash'} onClick={onCash}>
          Наличными при получении
        </CheckoutChoice>
      </div>
      {error ? <p className="mt-2 text-xs leading-4 text-danger">{error}</p> : null}
    </CheckoutBlock>
  );
}

export function DeliverySection({
  draft,
  errors,
  onAddressChange,
  onCityOpen,
  onDeliveryMethodChange,
  onPickupOpen,
}: {
  draft: OrderDraft;
  errors: CheckoutErrors;
  onAddressChange: (address: string) => void;
  onCityOpen: () => void;
  onDeliveryMethodChange: (method: DeliveryMethod) => void;
  onPickupOpen: () => void;
}) {
  const cityButtonClassName = `${checkoutFieldClassName} flex cursor-pointer items-center justify-between ${errors.city ? checkoutErrorFieldClassName : ''}`;

  return (
    <CheckoutBlock title="Способ доставки">
      <div className="grid gap-6 md:gap-5">
        <div className="grid grid-cols-2 gap-3 md:gap-2">
          <CheckoutChoice active={draft.deliveryMethod === 'courier'} centered onClick={() => onDeliveryMethodChange('courier')}>
            Курьером
          </CheckoutChoice>
          <CheckoutChoice active={draft.deliveryMethod === 'pickup_point'} centered onClick={() => onDeliveryMethodChange('pickup_point')}>
            В пункт выдачи
          </CheckoutChoice>
        </div>

        <p className="text-sm leading-5 text-[#9ca3af] md:hidden">
          Доставят<br />
          <span className="text-base leading-6 text-foreground">30 февраля 2025 г.</span>
        </p>

        {draft.deliveryMethod === 'courier' ? (
          <div className="grid gap-2">
            <p className="text-base leading-6">Доставить по адресу:</p>
            <div className="grid gap-2 md:grid-cols-[171px_1fr]">
              <button className={cityButtonClassName} onClick={onCityOpen} type="button">
                {draft.city || 'Город *'}
                <ChevronDown className="size-5 text-muted-foreground md:size-4" />
              </button>
              <input
                className={`${checkoutFieldClassName} ${errors.address ? checkoutErrorFieldClassName : ''}`}
                onChange={(event) => onAddressChange(event.target.value)}
                placeholder="улица, дом, квартира *"
                value={draft.address}
              />
            </div>
            {errors.city ? <p className="text-xs leading-4 text-danger">{errors.city}</p> : null}
            {errors.address ? <p className="text-xs leading-4 text-danger">{errors.address}</p> : null}
          </div>
        ) : (
          <div className="grid gap-3">
            <button className={cityButtonClassName} onClick={onCityOpen} type="button">
              {draft.city || 'Город *'}
              <ChevronDown className="size-5 text-muted-foreground md:size-4" />
            </button>
            {errors.city ? <p className="text-xs leading-4 text-danger">{errors.city}</p> : null}
            <div className="grid gap-3 md:grid-cols-[176px_1fr] md:items-center md:gap-2">
              <button
                className="order-2 h-10 cursor-pointer rounded-md border border-primary bg-card px-4 text-base leading-6 font-bold text-primary md:order-none"
                onClick={onPickupOpen}
                type="button"
              >
                Выбрать
              </button>
              <div>
                <p className="text-base leading-6">{draft.pickupPoint?.address ?? 'Адрес пункта выдачи'}</p>
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
  );
}

export function RecipientSection({ draft, error, onCommentChange, onPhoneChange, user }: {
  draft: OrderDraft;
  error?: string;
  onCommentChange: (comment: string) => void;
  onPhoneChange: (phone: string) => void;
  user: User | null;
}) {
  return (
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
              className={`${checkoutFieldClassName} ${error ? checkoutErrorFieldClassName : ''}`}
              onChange={(event) => onPhoneChange(event.target.value)}
              placeholder="+7"
              value={draft.phone}
            />
            {error ? <span className="text-xs leading-4 text-danger">{error}</span> : null}
          </label>
        </div>

        <label className="grid gap-1 text-sm leading-5">
          Комментарий к заказу
          <textarea
            className="h-[120px] resize-none rounded-sm border border-[#9ca3af] bg-card p-3 outline-none md:h-[120px]"
            onChange={(event) => onCommentChange(event.target.value)}
            value={draft.comment}
          />
        </label>
      </div>
    </CheckoutBlock>
  );
}
