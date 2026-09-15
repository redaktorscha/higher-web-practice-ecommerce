import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getFieldErrors, registerSchema, type RegisterFormValues } from '@/lib/validation';
import { useLoginMutation, useRegisterMutation } from '@/store/api';
import { AuthLayout } from './AuthLayout';

const inputClassName =
  'h-9 w-full rounded-sm border border-[#9ca3af] bg-card px-3 text-sm leading-5 text-foreground outline-none placeholder:text-[#9ca3af] focus:border-primary focus:ring-2 focus:ring-ring/20 md:h-10 md:text-base md:leading-6';
const errorInputClassName = 'border-danger focus:border-danger focus:ring-danger/20';

function getRegisterErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: unknown }).data;

    if (typeof data === 'string') {
      return data;
    }
  }

  return 'Не удалось зарегистрироваться. Попробуйте ещё раз.';
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [errorMessage, setErrorMessage] = useState('');
  const isLoading = isRegistering || isLoggingIn;
  const {
    clearErrors,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<RegisterFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const clearFieldError = (field: keyof RegisterFormValues) => {
    clearErrors(field);
    setErrorMessage('');
  };

  const submitForm: SubmitHandler<RegisterFormValues> = async (values) => {
    setErrorMessage('');

    const validationResult = registerSchema.safeParse(values);

    if (!validationResult.success) {
      const validationErrors = getFieldErrors(validationResult.error);

      if (validationErrors.firstName) {
        setError('firstName', { message: validationErrors.firstName });
      }

      if (validationErrors.lastName) {
        setError('lastName', { message: validationErrors.lastName });
      }

      if (validationErrors.email) {
        setError('email', { message: validationErrors.email });
      }

      if (validationErrors.password) {
        setError('password', { message: validationErrors.password });
      }

      if (validationErrors.confirmPassword) {
        setError('confirmPassword', { message: validationErrors.confirmPassword });
      }

      return;
    }

    try {
      await registerUser(validationResult.data).unwrap();
      await login({
        email: validationResult.data.email,
        password: validationResult.data.password,
      }).unwrap();
      navigate('/profile', { replace: true });
    } catch (error) {
      setErrorMessage(getRegisterErrorMessage(error));
    }
  };

  return (
    <AuthLayout
      desktopCardClassName="md:absolute md:top-16 md:left-[530px] md:h-[608px] md:w-[380px] md:rounded-xl md:bg-card md:p-6 md:shadow-modal"
      footerLinkText="войти в аккаунт"
      footerText="Уже зарегистрированы?"
      footerTo="/login"
      mobileFormClassName="absolute top-[191px] left-5 w-[335px] md:static md:mt-6 md:w-[332px]"
      title="Регистрация"
    >
      <form className="grid gap-4 md:gap-4" noValidate onSubmit={handleSubmit(submitForm)}>
        <label className="grid gap-1 text-xs leading-4 text-muted-foreground">
          <span className="hidden md:inline">Имя *</span>
          <input
            aria-invalid={Boolean(errors.firstName)}
            className={cn(inputClassName, errors.firstName && errorInputClassName)}
            placeholder="Имя *"
            {...register('firstName', {
              onChange: () => clearFieldError('firstName'),
            })}
          />
          {errors.firstName?.message ? <span className="text-xs leading-4 text-danger">{errors.firstName.message}</span> : null}
        </label>

        <label className="grid gap-1 text-xs leading-4 text-muted-foreground">
          <span className="hidden md:inline">Фамилия *</span>
          <input
            aria-invalid={Boolean(errors.lastName)}
            className={cn(inputClassName, errors.lastName && errorInputClassName)}
            placeholder="Фамилия *"
            {...register('lastName', {
              onChange: () => clearFieldError('lastName'),
            })}
          />
          {errors.lastName?.message ? <span className="text-xs leading-4 text-danger">{errors.lastName.message}</span> : null}
        </label>

        <label className="grid gap-1 text-xs leading-4 text-muted-foreground">
          <span className="hidden md:inline">Email *</span>
          <input
            aria-invalid={Boolean(errors.email)}
            className={cn(inputClassName, errors.email && errorInputClassName)}
            placeholder="Email *"
            type="email"
            {...register('email', {
              onChange: () => clearFieldError('email'),
            })}
          />
          {errors.email?.message ? <span className="text-xs leading-4 text-danger">{errors.email.message}</span> : null}
        </label>

        <label className="grid gap-1 text-xs leading-4 text-muted-foreground">
          <span className="hidden md:inline">Придумайте пароль *</span>
          <input
            aria-invalid={Boolean(errors.password)}
            className={cn(inputClassName, errors.password && errorInputClassName)}
            placeholder="Придумайте пароль *"
            type="password"
            {...register('password', {
              onChange: () => clearFieldError('password'),
            })}
          />
          {errors.password?.message ? <span className="text-xs leading-4 text-danger">{errors.password.message}</span> : null}
        </label>

        <label className="grid gap-1 text-xs leading-4 text-muted-foreground">
          <span className="hidden md:inline">Повторите пароль *</span>
          <input
            aria-invalid={Boolean(errors.confirmPassword)}
            className={cn(inputClassName, errors.confirmPassword && errorInputClassName)}
            placeholder="Повторите пароль *"
            type="password"
            {...register('confirmPassword', {
              onChange: () => clearFieldError('confirmPassword'),
            })}
          />
          {errors.confirmPassword?.message ? <span className="text-xs leading-4 text-danger">{errors.confirmPassword.message}</span> : null}
        </label>

        {errorMessage ? <p className="text-sm leading-5 text-danger">{errorMessage}</p> : null}

        <button
          className="mt-1 h-9 cursor-pointer rounded-md bg-primary px-4 text-sm leading-5 font-bold text-white shadow-modal disabled:bg-muted disabled:text-muted-foreground md:mt-2 md:h-10 md:text-base md:leading-6"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? 'Регистрируем...' : 'Зарегистрироваться'}
        </button>
      </form>
    </AuthLayout>
  );
}
