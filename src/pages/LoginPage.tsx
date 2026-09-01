import { Link } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';

const inputClassName =
  'w-full rounded-sm border border-[#9ca3af] bg-card px-3 text-foreground outline-none placeholder:text-[#9ca3af] focus:border-primary focus:ring-2 focus:ring-ring/20';

export function LoginPage() {
  return (
    <AuthLayout
      desktopCardClassName="md:absolute md:top-[158px] md:left-[530px] md:h-[420px] md:w-[380px] md:rounded-xl md:bg-card md:p-6 md:shadow-modal"
      footerLinkText="Зарегистрироваться"
      footerText="У вас ещё нет аккаунта?"
      footerTo="/register"
      mobileFormClassName="absolute top-[305px] left-5 w-[335px] md:static md:mt-7 md:w-[332px]"
      title="Вход в аккаунт"
    >
      <form className="grid gap-4 md:gap-[18px]">
        <label className="hidden gap-1 text-xs leading-4 text-muted-foreground md:grid">
          Ваш email или логин
          <input className={`${inputClassName} h-10 text-base leading-6`} placeholder="ivanov@yandex.ru" type="email" />
        </label>

        <input
          className={`${inputClassName} h-9 text-sm leading-5 md:hidden`}
          placeholder="Ваш email или логин"
          type="email"
        />

        <div className="grid gap-1">
          <label className="hidden gap-1 text-xs leading-4 text-muted-foreground md:grid">
            Пароль
            <input className={`${inputClassName} h-10 text-base leading-6`} placeholder="*******" type="password" />
          </label>

          <input className={`${inputClassName} h-9 text-sm leading-5 md:hidden`} placeholder="Пароль" type="password" />

          <div className="flex justify-end">
            <Link to="/login" className="text-xs leading-4 text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-base md:leading-6">
              Забыли пароль?
            </Link>
          </div>
        </div>

        <button className="h-9 rounded-md bg-primary px-4 text-sm leading-5 font-bold text-white shadow-modal md:mt-2 md:h-10 md:text-base md:leading-6" type="button">
          Войти
        </button>
      </form>
    </AuthLayout>
  );
}
