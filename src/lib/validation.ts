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
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
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
