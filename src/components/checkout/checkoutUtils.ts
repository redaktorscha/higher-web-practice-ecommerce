import toast from 'react-hot-toast';
import type { SavedPaymentCard } from '@/store/orderSlice';

export type CheckoutErrors = Partial<Record<'selectedCardId' | 'city' | 'address' | 'pickupPointId' | 'phone', string>>;

export const checkoutFieldClassName =
  'h-10 rounded-sm border border-[#9ca3af] bg-card px-3 text-sm leading-5 outline-none placeholder:text-[#9ca3af] md:text-base md:leading-6';
export const checkoutErrorFieldClassName = 'border-danger focus:border-danger';

const FREE_DELIVERY_THRESHOLD = 5000;
const DELIVERY_PRICE = 300;

function getCardsStorageKey(userId: string) {
  return `quant:payment-cards:${userId}`;
}

export function loadSavedCards(userId: string) {
  try {
    const rawCards = localStorage.getItem(getCardsStorageKey(userId));
    return rawCards ? (JSON.parse(rawCards) as SavedPaymentCard[]) : [];
  } catch {
    toast.error('Не удалось загрузить сохранённые карты');
    return [];
  }
}

export function saveCards(userId: string, cards: SavedPaymentCard[]) {
  localStorage.setItem(getCardsStorageKey(userId), JSON.stringify(cards));
}

export function getDeliveryPrice(cartTotalPrice: number) {
  return cartTotalPrice > FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_PRICE;
}
