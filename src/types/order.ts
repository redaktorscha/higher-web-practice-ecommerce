export type Order = {
  id: string;
  number: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalPrice: number;

  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;

  deliveryAddress?: Address;
  pickupPointId?: string;

  customer: OrderCustomerInfo;

  comment?: string;

  createdAt: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'card_online' | 'card_on_delivery' | 'cash';

export type DeliveryMethod = 'courier' | 'pickup_point';

export type Address = {
  country: string;
  city: string;
  street: string;
  house: string;
  apartment?: string;
  postalCode?: string;
};

export type PickupPoint = {
  id: string;
  name: string;
  address: string;
};

export type OrderCustomerInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type CreateOrderPayload = {
  phone: string;
  comment?: string;

  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;

  deliveryAddress?: Address;
  pickupPointId?: string;
};
