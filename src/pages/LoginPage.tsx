import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getFieldErrors, loginSchema, type LoginFormValues } from '@/lib/validation';
import { useLoginMutation } from '@/store/api';
import { AuthLayout } from './AuthLayout';

const inputClassName =
  'w-full rounded-sm border border-[#9ca3af] bg-card px-3 text-foreground outline-none placeholder:text-[#9ca3af] focus:border-primary focus:ring-2 focus:ring-ring/20';
const errorInputClassName = 'border-danger focus:border-danger focus:ring-danger/20';

function getAuthErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: unknown }).data;

    if (typeof data === 'string') {
      return data;
    }
  }

  return 'Не удалось войти. Попробуйте ещё раз.';
}

export function LoginPage() {
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [errorMessage, setErrorMessage] = useState('');
  const {
    clearErrors,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const submitForm: SubmitHandler<LoginFormValues> = async (values) => {
    setErrorMessage('');

    const validationResult = loginSchema.safeParse(values);

    if (!validationResult.success) {
      const validationErrors = getFieldErrors(validationResult.error);

      if (validationErrors.email) {
        setError('email', { message: validationErrors.email });
      }

      if (validationErrors.password) {
        setError('password', { message: validationErrors.password });
      }

      return;
    }

    try {
      await login(validationResult.data).unwrap();
      navigate('/profile', { replace: true });
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    }
  };

  return (
    <AuthLayout
      desktopCardClassName="md:absolute md:top-[158px] md:left-[530px] md:h-[420px] md:w-[380px] md:rounded-xl md:bg-card md:p-6 md:shadow-modal"
      footerLinkText="Зарегистрироваться"
      footerText="У вас ещё нет аккаунта?"
      footerTo="/register"
      mobileFormClassName="absolute top-[305px] left-5 w-[335px] md:static md:mt-7 md:w-[332px]"
      title="Вход в аккаунт"
    >
      <form className="grid gap-4 md:gap-[18px]" noValidate onSubmit={handleSubmit(submitForm)}>
        <label className="grid gap-1 text-xs leading-4 text-muted-foreground">
          <span className="hidden md:inline">Ваш email или логин *</span>
          <input
            className={cn(inputClassName, 'h-9 text-sm leading-5 md:h-10 md:text-base md:leading-6', errors.email && errorInputClassName)}
            aria-invalid={Boolean(errors.email)}
            placeholder="Ваш email или логин *"
            type="email"
            {...register('email', {
              onChange: () => clearErrors('email'),
            })}
          />
          {errors.email?.message ? <span className="text-xs leading-4 text-danger">{errors.email.message}</span> : null}
        </label>

        <div className="grid gap-1">
          <label className="grid gap-1 text-xs leading-4 text-muted-foreground">
            <span className="hidden md:inline">Пароль *</span>
            <input
              className={cn(inputClassName, 'h-9 text-sm leading-5 md:h-10 md:text-base md:leading-6', errors.password && errorInputClassName)}
              aria-invalid={Boolean(errors.password)}
              placeholder="Пароль *"
              type="password"
              {...register('password', {
                onChange: () => clearErrors('password'),
              })}
            />
            {errors.password?.message ? <span className="text-xs leading-4 text-danger">{errors.password.message}</span> : null}
          </label>

          <div className="flex justify-end">
            <Link to="/login" className="text-xs leading-4 text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-base md:leading-6">
              Забыли пароль?
            </Link>
          </div>
        </div>

        {errorMessage ? <p className="text-sm leading-5 text-danger">{errorMessage}</p> : null}

        <button
          className="h-9 rounded-md bg-primary px-4 text-sm leading-5 font-bold text-white shadow-modal disabled:bg-muted disabled:text-muted-foreground md:mt-2 md:h-10 md:text-base md:leading-6"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? 'Входим...' : 'Войти'}
        </button>
      </form>
    </AuthLayout>
  );
}
