import {
  checkoutSchema,
  getFieldErrors,
  loginSchema,
  passwordRecoverySchema,
  paymentCardSchema,
  registerSchema,
} from './validation';

describe('validation schemas', () => {
  it('validates required login fields', () => {
    const result = loginSchema.safeParse({ email: '', password: '' });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(getFieldErrors(result.error)).toEqual({
        email: 'Введите email',
        password: 'Введите пароль',
      });
    }
  });

  it('validates password confirmation during registration', () => {
    const result = registerSchema.safeParse({
      firstName: 'Иван',
      lastName: 'Иванов',
      email: 'ivan@example.com',
      password: '123456',
      confirmPassword: '654321',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(getFieldErrors(result.error).confirmPassword).toBe('Пароли не совпадают');
    }
  });

  it('validates checkout courier fields', () => {
    const result = checkoutSchema.safeParse({
      paymentMethod: 'cash',
      selectedCardId: null,
      deliveryMethod: 'courier',
      city: '',
      address: '',
      pickupPointId: null,
      phone: '',
      comment: '',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(getFieldErrors(result.error)).toMatchObject({
        city: 'Выберите город',
        address: 'Введите адрес доставки',
        phone: 'Введите номер телефона',
      });
    }
  });

  it('validates pickup point choice and card choice when they are required', () => {
    const result = checkoutSchema.safeParse({
      paymentMethod: 'card_online',
      selectedCardId: null,
      deliveryMethod: 'pickup_point',
      city: 'Москва',
      address: '',
      pickupPointId: null,
      phone: '+7 999 123-45-67',
      comment: '',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(getFieldErrors(result.error)).toMatchObject({
        selectedCardId: 'Выберите карту или добавьте новую',
        pickupPointId: 'Выберите пункт выдачи',
      });
    }
  });

  it('validates payment card and password recovery email', () => {
    expect(paymentCardSchema.safeParse({
      number: '1111222233334444',
      name: 'IVAN IVANOV',
      expiry: '12/30',
      cvc: '123',
    }).success).toBe(true);

    expect(passwordRecoverySchema.safeParse({ email: 'bad-email' }).success).toBe(false);
  });
});
