import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';
import type { DeliveryMethod, Order, PaymentMethod, PickupPoint } from '@/types';

export type CheckoutCity = 'Москва' | 'Санкт-Петербург';

export type SavedPaymentCard = {
  id: string;
  last4: string;
  holderName: string;
  expiry: string;
};

export type SuccessfulOrderPayment = {
  method: PaymentMethod;
  cardLast4?: string;
};

export type SuccessfulOrder = Order & {
  payment: SuccessfulOrderPayment;
  pickupPoint?: PickupPoint;
};

type OrderState = {
  paymentMethod: PaymentMethod;
  selectedCardId: string | null;
  savedCards: SavedPaymentCard[];
  deliveryMethod: DeliveryMethod;
  city: CheckoutCity | '';
  address: string;
  pickupPoint: PickupPoint | null;
  phone: string;
  comment: string;
  lastSuccessfulOrder: SuccessfulOrder | null;
};

const initialState: OrderState = {
  paymentMethod: 'cash',
  selectedCardId: null,
  savedCards: [],
  deliveryMethod: 'courier',
  city: '',
  address: '',
  pickupPoint: null,
  phone: '',
  comment: '',
  lastSuccessfulOrder: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setSavedCards: (state, action: PayloadAction<SavedPaymentCard[]>) => {
      state.savedCards = action.payload;

      if (!state.selectedCardId && action.payload.length > 0) {
        state.paymentMethod = 'card_online';
        state.selectedCardId = action.payload[0].id;
      }
    },
    addSavedCard: (state, action: PayloadAction<SavedPaymentCard>) => {
      state.savedCards.push(action.payload);
      state.paymentMethod = 'card_online';
      state.selectedCardId = action.payload.id;
    },
    selectSavedCard: (state, action: PayloadAction<string>) => {
      state.paymentMethod = 'card_online';
      state.selectedCardId = action.payload;
    },
    setPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.paymentMethod = action.payload;
      state.selectedCardId = action.payload === 'cash' ? null : state.selectedCardId;
    },
    setDeliveryMethod: (state, action: PayloadAction<DeliveryMethod>) => {
      state.deliveryMethod = action.payload;
    },
    setCity: (state, action: PayloadAction<CheckoutCity>) => {
      state.city = action.payload;
      state.pickupPoint = null;
    },
    setAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
    },
    setPickupPoint: (state, action: PayloadAction<PickupPoint>) => {
      state.pickupPoint = action.payload;
    },
    setPhone: (state, action: PayloadAction<string>) => {
      state.phone = action.payload;
    },
    setComment: (state, action: PayloadAction<string>) => {
      state.comment = action.payload;
    },
    setLastSuccessfulOrder: (state, action: PayloadAction<SuccessfulOrder>) => {
      state.lastSuccessfulOrder = action.payload;
    },
    resetOrderDraft: (state) => {
      const savedCards = state.savedCards;
      const lastSuccessfulOrder = state.lastSuccessfulOrder;

      return {
        ...initialState,
        savedCards,
        lastSuccessfulOrder,
        paymentMethod: savedCards.length > 0 ? 'card_online' : 'cash',
        selectedCardId: savedCards[0]?.id ?? null,
      };
    },
  },
});

export const {
  addSavedCard,
  resetOrderDraft,
  selectSavedCard,
  setAddress,
  setCity,
  setComment,
  setDeliveryMethod,
  setLastSuccessfulOrder,
  setPaymentMethod,
  setPhone,
  setPickupPoint,
  setSavedCards,
} = orderSlice.actions;
export const orderReducer = orderSlice.reducer;
export const selectOrderDraft = (state: RootState) => state.order;
export const selectLastSuccessfulOrder = (state: RootState) => state.order.lastSuccessfulOrder;
