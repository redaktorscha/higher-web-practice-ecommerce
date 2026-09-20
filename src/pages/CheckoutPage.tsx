import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import orderImage from '@/assets/order.png';
import {
  CityModal,
  DeliverySection,
  OrderSummary,
  PaymentCardModal,
  PaymentSection,
  PickupPointModal,
  RecipientSection,
  getDeliveryPrice,
  loadSavedCards,
  saveCards,
  type CheckoutErrors,
} from '@/components/checkout';
import { checkoutSchema, getFieldErrors } from '@/lib/validation';
import { useClearCartMutation, useCreateOrderMutation, useGetPickupPointsQuery } from '@/store/api';
import { selectCurrentUser } from '@/store/authSlice';
import { clearCart, selectCart } from '@/store/cartSlice';
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
} from '@/store/orderSlice';

export function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const cart = useSelector(selectCart);
  const orderDraft = useSelector(selectOrderDraft);
  const [createOrder, { isLoading: isOrderCreating }] = useCreateOrderMutation();
  const [clearServerCart, { isLoading: isCartClearing }] = useClearCartMutation();
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
    if (user) dispatch(setSavedCards(loadSavedCards(user.id)));
  }, [dispatch, user]);

  const clearError = (field: keyof CheckoutErrors) => {
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
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
      ? { country: 'Россия', city: orderDraft.city, street: orderDraft.address, house: '-' }
      : undefined;

    try {
      const createdOrder = await createOrder({
        phone: orderDraft.phone,
        comment: orderDraft.comment || undefined,
        paymentMethod: orderDraft.paymentMethod,
        payment: {
          method: orderDraft.paymentMethod,
          cardLast4: orderDraft.paymentMethod === 'card_online' ? selectedCard?.last4 : undefined,
        },
        deliveryMethod: orderDraft.deliveryMethod,
        deliveryAddress,
        pickupPointId: orderDraft.deliveryMethod === 'pickup_point' ? orderDraft.pickupPoint?.id : undefined,
        pickupPoint: orderDraft.deliveryMethod === 'pickup_point' ? orderDraft.pickupPoint ?? undefined : undefined,
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

      await clearServerCart().unwrap();
      dispatch(clearCart());
      dispatch(resetOrderDraft());
      navigate(`/success?orderId=${encodeURIComponent(createdOrder.id)}`);
    } catch {
      setFormMessage('Не удалось оформить заказ. Попробуйте ещё раз.');
    }
  };

  return (
    <section className="grid gap-8 pb-8 md:mx-auto md:w-[980px] md:grid-cols-[580px_380px] md:gap-5 md:pt-2">
      <div className="grid gap-6 md:gap-6">
        <PaymentSection
          draft={orderDraft}
          error={errors.selectedCardId}
          onAddCard={() => setIsCardModalOpen(true)}
          onCash={() => {
            dispatch(setPaymentMethod('cash'));
            clearError('selectedCardId');
          }}
          onSelectCard={(cardId) => {
            dispatch(selectSavedCard(cardId));
            clearError('selectedCardId');
          }}
        />
        <DeliverySection
          draft={orderDraft}
          errors={errors}
          onAddressChange={(address) => {
            dispatch(setAddress(address));
            clearError('address');
          }}
          onCityOpen={() => setIsCityModalOpen(true)}
          onDeliveryMethodChange={(method) => dispatch(setDeliveryMethod(method))}
          onPickupOpen={() => setIsPickupModalOpen(true)}
        />
        <RecipientSection
          draft={orderDraft}
          error={errors.phone}
          onCommentChange={(comment) => dispatch(setComment(comment))}
          onPhoneChange={(phone) => {
            dispatch(setPhone(phone));
            clearError('phone');
          }}
          user={user}
        />
      </div>

      <aside className="flex flex-col md:sticky md:top-24">
        <OrderSummary
          deliveryPrice={deliveryPrice}
          formMessage={formMessage}
          isLoading={isOrderCreating || isCartClearing}
          itemsCount={cart.totalItems}
          onPayment={handlePayment}
          subtotal={cart.totalPrice}
          total={totalPrice}
        />
        <img alt="" className="hidden h-[363px] w-[446px] object-contain md:block" src={orderImage} />
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
            toast.success('Карта добавлена');
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
