import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Введите email')
    .email('Введите корректный email'),
  password: z
    .string()
    .min(1, 'Введите пароль'),
});

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, 'Введите имя')
      .max(50, 'Имя должно быть короче 50 символов'),
    lastName: z
      .string()
      .trim()
      .min(1, 'Введите фамилию')
      .max(50, 'Фамилия должна быть короче 50 символов'),
    email: z
      .string()
      .trim()
      .min(1, 'Введите email')
      .email('Введите корректный email'),
    password: z
      .string()
      .min(1, 'Введите пароль')
      .min(6, 'Пароль должен быть не короче 6 символов'),
    confirmPassword: z
      .string()
      .min(1, 'Повторите пароль'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'Введите имя')
    .max(50, 'Имя должно быть короче 50 символов'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Введите фамилию')
    .max(50, 'Фамилия должна быть короче 50 символов'),
  email: z
    .string()
    .trim()
    .min(1, 'Введите email')
    .email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

export const passwordRecoverySchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Введите email')
    .email('Введите корректный email'),
});

export const checkoutSchema = z
  .object({
    paymentMethod: z.enum(['card_online', 'cash']),
    selectedCardId: z.string().nullable(),
    deliveryMethod: z.enum(['courier', 'pickup_point']),
    city: z.string().min(1, 'Выберите город'),
    address: z.string(),
    pickupPointId: z.string().nullable(),
    phone: z
      .string()
      .trim()
      .min(1, 'Введите номер телефона')
      .regex(/^\+?[0-9\s()-]{10,20}$/, 'Введите корректный номер телефона'),
    comment: z.string(),
  })
  .superRefine((values, context) => {
    if (values.paymentMethod === 'card_online' && !values.selectedCardId) {
      context.addIssue({
        code: 'custom',
        message: 'Выберите карту или добавьте новую',
        path: ['selectedCardId'],
      });
    }

    if (values.deliveryMethod === 'courier' && values.address.trim().length === 0) {
      context.addIssue({
        code: 'custom',
        message: 'Введите адрес доставки',
        path: ['address'],
      });
    }

    if (values.deliveryMethod === 'pickup_point' && !values.pickupPointId) {
      context.addIssue({
        code: 'custom',
        message: 'Выберите пункт выдачи',
        path: ['pickupPointId'],
      });
    }
  });

export const paymentCardSchema = z.object({
  number: z
    .string()
    .regex(/^\d{16}$/, 'Введите 16 цифр номера карты'),
  name: z
    .string()
    .trim()
    .min(1, 'Введите имя владельца карты'),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Введите срок в формате MM/YY'),
  cvc: z
    .string()
    .regex(/^\d{3,4}$/, 'Введите CVC'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type PasswordRecoveryFormValues = z.infer<typeof passwordRecoverySchema>;
export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
export type PaymentCardFormValues = z.infer<typeof paymentCardSchema>;
export type FieldErrors<T extends Record<string, unknown>> = Partial<Record<keyof T, string>>;

export function getFieldErrors<T extends Record<string, unknown>>(error: z.ZodError<T>): FieldErrors<T> {
  return error.issues.reduce<FieldErrors<T>>((errors, issue) => {
    const field = issue.path[0];

    if (typeof field === 'string' && !errors[field as keyof T]) {
      errors[field as keyof T] = issue.message;
    }

    return errors;
  }, {});
}
