import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import { getFieldErrors, paymentCardSchema, type PaymentCardFormValues } from '@/lib/validation';
import type { CheckoutCity, SavedPaymentCard } from '@/store/orderSlice';
import type { PickupPoint } from '@/types';
import { checkoutErrorFieldClassName, checkoutFieldClassName } from './checkoutUtils';

type CardFocus = 'name' | 'number' | 'expiry' | 'cvc' | '';
const cities: CheckoutCity[] = ['Москва', 'Санкт-Петербург'];

export function PaymentCardModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (card: SavedPaymentCard) => void;
}) {
  const [values, setValues] = useState<PaymentCardFormValues>({ number: '', name: '', expiry: '', cvc: '' });
  const [focused, setFocused] = useState<CardFocus>('');
  const [errors, setErrors] = useState<Partial<Record<keyof PaymentCardFormValues, string>>>({});

  const changeValue = (field: keyof PaymentCardFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: field === 'name' ? value : value.replace(/[^\d/]/g, '') }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const saveCard = () => {
    const validationResult = paymentCardSchema.safeParse({
      ...values,
      number: values.number.replace(/\D/g, ''),
      cvc: values.cvc.replace(/\D/g, ''),
    });

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
    <CheckoutModal title="Новая карта" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Cards cvc={values.cvc} expiry={values.expiry} focused={focused} name={values.name} number={values.number} />
        <CardField
          error={errors.number}
          label="Номер карты *"
          maxLength={16}
          onChange={(value) => changeValue('number', value)}
          onFocus={() => setFocused('number')}
          placeholder="0000000000000000"
          value={values.number}
        />
        <CardField
          error={errors.name}
          label="Имя владельца *"
          onChange={(value) => changeValue('name', value)}
          onFocus={() => setFocused('name')}
          placeholder="IVAN PETROV"
          value={values.name}
        />
        <div className="flex flex-row gap-3">
          <CardField
            error={errors.expiry}
            label="Срок *"
            maxLength={5}
            onChange={(value) => changeValue('expiry', value)}
            onFocus={() => setFocused('expiry')}
            placeholder="MM/YY"
            value={values.expiry}
          />
          <CardField
            error={errors.cvc}
            label="CVC *"
            maxLength={4}
            onChange={(value) => changeValue('cvc', value)}
            onFocus={() => setFocused('cvc')}
            placeholder="123"
            value={values.cvc}
          />
        </div>
        <button className="h-10 cursor-pointer rounded-md bg-primary px-4 text-base leading-6 font-bold text-white" onClick={saveCard} type="button">
          Сохранить карту
        </button>
      </div>
    </CheckoutModal>
  );
}

function CardField({ error, label, maxLength, onChange, onFocus, placeholder, value }: {
  error?: string;
  label: string;
  maxLength?: number;
  onChange: (value: string) => void;
  onFocus: () => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm leading-5 flex-1">
      {label}
      <input
        className={`w-full ${checkoutFieldClassName} ${error ? checkoutErrorFieldClassName : ''}`}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        value={value}
      />
      {error ? <span className="text-xs leading-4 text-danger">{error}</span> : null}
    </label>
  );
}

export function CityModal({ onClose, onSelect }: { onClose: () => void; onSelect: (city: CheckoutCity) => void }) {
  return (
    <CheckoutModal title="Выберите город" onClose={onClose}>
      <div className="grid gap-2">
        {cities.map((city) => (
          <button
            className="h-10 cursor-pointer rounded-md border border-muted-foreground bg-card px-4 text-left text-base leading-6 hover:border-primary hover:text-primary"
            key={city}
            onClick={() => onSelect(city)}
            type="button"
          >
            {city}
          </button>
        ))}
      </div>
    </CheckoutModal>
  );
}

export function PickupPointModal({ city, isLoading, onClose, onSelect, points }: {
  city: CheckoutCity | '';
  isLoading: boolean;
  onClose: () => void;
  onSelect: (point: PickupPoint) => void;
  points: PickupPoint[];
}) {
  return (
    <CheckoutModal title="Пункт выдачи" onClose={onClose}>
      {!city ? (
        <p className="text-sm leading-5 text-muted-foreground">Сначала выберите город.</p>
      ) : isLoading ? (
        <p className="text-sm leading-5 text-muted-foreground">Загружаем пункты выдачи...</p>
      ) : points.length > 0 ? (
        <div className="grid gap-2">
          {points.map((point) => (
            <button
              className="cursor-pointer rounded-md border border-muted-foreground bg-card p-3 text-left hover:border-primary hover:text-primary"
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
    </CheckoutModal>
  );
}

function CheckoutModal({ children, onClose, title }: { children: ReactNode; onClose: () => void; title: string }) {
  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-5">
      <div className="w-full max-w-[420px] rounded-xl bg-card p-6 shadow-modal">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl leading-5">{title}</h2>
          <button aria-label="Закрыть" className="grid size-8 cursor-pointer place-items-center text-muted-foreground" onClick={onClose} type="button">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
