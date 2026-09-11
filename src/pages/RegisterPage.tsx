import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation, useRegisterMutation } from '@/store/api';
import { AuthLayout } from './AuthLayout';

const inputClassName =
  'h-9 w-full rounded-sm border border-[#9ca3af] bg-card px-3 text-sm leading-5 text-foreground outline-none placeholder:text-[#9ca3af] focus:border-primary focus:ring-2 focus:ring-ring/20 md:h-10 md:text-base md:leading-6';

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
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const isLoading = isRegistering || isLoggingIn;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
      }).unwrap();
      await login({ email, password }).unwrap();
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
      <form className="grid gap-4 md:gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-1 text-xs leading-4 text-muted-foreground">
          <span className="hidden md:inline">Имя</span>
          <input
            className={inputClassName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="Имя"
            required
            value={firstName}
          />
        </label>

        <label className="grid gap-1 text-xs leading-4 text-muted-foreground">
          <span className="hidden md:inline">Фамилия</span>
          <input
            className={inputClassName}
            onChange={(event) => setLastName(event.target.value)}
            placeholder="Фамилия"
            required
            value={lastName}
          />
        </label>

        <label className="grid gap-1 text-xs leading-4 text-muted-foreground">
          <span className="hidden md:inline">Email</span>
          <input
            className={inputClassName}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            required
            type="email"
            value={email}
          />
        </label>

        <label className="grid gap-1 text-xs leading-4 text-muted-foreground">
          <span className="hidden md:inline">Придумайте пароль</span>
          <input
            className={inputClassName}
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Придумайте пароль"
            required
            type="password"
            value={password}
          />
        </label>

        <label className="grid gap-1 text-xs leading-4 text-muted-foreground">
          <span className="hidden md:inline">Повторите пароль</span>
          <input
            className={inputClassName}
            minLength={6}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Повторите пароль"
            required
            type="password"
            value={confirmPassword}
          />
        </label>

        {errorMessage ? <p className="text-sm leading-5 text-danger">{errorMessage}</p> : null}

        <button
          className="mt-1 h-9 rounded-md bg-primary px-4 text-sm leading-5 font-bold text-white shadow-modal disabled:bg-muted disabled:text-muted-foreground md:mt-2 md:h-10 md:text-base md:leading-6"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? 'Регистрируем...' : 'Зарегистрироваться'}
        </button>
      </form>
    </AuthLayout>
  );
}
