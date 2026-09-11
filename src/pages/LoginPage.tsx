import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '@/store/api';
import { AuthLayout } from './AuthLayout';

const inputClassName =
  'w-full rounded-sm border border-[#9ca3af] bg-card px-3 text-foreground outline-none placeholder:text-[#9ca3af] focus:border-primary focus:ring-2 focus:ring-ring/20';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      await login({ email, password }).unwrap();
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
      <form className="grid gap-4 md:gap-[18px]" onSubmit={handleSubmit}>
        <label className="hidden gap-1 text-xs leading-4 text-muted-foreground md:grid">
          Ваш email или логин
          <input
            className={`${inputClassName} h-10 text-base leading-6`}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ivan@example.com"
            required
            type="email"
            value={email}
          />
        </label>

        <input
          className={`${inputClassName} h-9 text-sm leading-5 md:hidden`}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Ваш email или логин"
          required
          type="email"
          value={email}
        />

        <div className="grid gap-1">
          <label className="hidden gap-1 text-xs leading-4 text-muted-foreground md:grid">
            Пароль
            <input
              className={`${inputClassName} h-10 text-base leading-6`}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="*******"
              required
              type="password"
              value={password}
            />
          </label>

          <input
            className={`${inputClassName} h-9 text-sm leading-5 md:hidden`}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Пароль"
            required
            type="password"
            value={password}
          />

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
