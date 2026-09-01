import { AuthLayout } from './AuthLayout';

const inputClassName =
  'h-9 w-full rounded-sm border border-[#9ca3af] bg-card px-3 text-sm leading-5 text-foreground outline-none placeholder:text-[#9ca3af] focus:border-primary focus:ring-2 focus:ring-ring/20 md:h-10 md:text-base md:leading-6';

export function RegisterPage() {
  return (
    <AuthLayout
      desktopCardClassName="md:absolute md:top-16 md:left-[530px] md:h-[608px] md:w-[380px] md:rounded-xl md:bg-card md:p-6 md:shadow-modal"
      footerLinkText="войти в аккаунт"
      footerText="Уже зарегистрированы?"
      footerTo="/login"
      mobileFormClassName="absolute top-[191px] left-5 w-[335px] md:static md:mt-6 md:w-[332px]"
      title="Регистрация"
    >
      <form className="grid gap-4 md:gap-4">
        <label className="grid gap-1 text-xs leading-4 text-muted-foreground">
          <span className="hidden md:inline">Имя</span>
          <input className={inputClassName} placeholder="Имя" />
        </label>

        <label className="grid gap-1 text-xs leading-4 text-muted-foreground">
          <span className="hidden md:inline">Фамилия</span>
          <input className={inputClassName} placeholder="Фамилия" />
        </label>

        <label className="grid gap-1 text-xs leading-4 text-muted-foreground">
          <span className="hidden md:inline">Email</span>
          <input className={inputClassName} placeholder="Email" type="email" />
        </label>

        <label className="grid gap-1 text-xs leading-4 text-muted-foreground">
          <span className="hidden md:inline">Придумайте пароль</span>
          <input className={inputClassName} placeholder="Придумайте пароль" type="password" />
        </label>

        <label className="grid gap-1 text-xs leading-4 text-muted-foreground">
          <span className="hidden md:inline">Повторите пароль</span>
          <input className={inputClassName} placeholder="Повторите пароль" type="password" />
        </label>

        <button className="mt-1 h-9 rounded-md bg-primary px-4 text-sm leading-5 font-bold text-white shadow-modal md:mt-2 md:h-10 md:text-base md:leading-6" type="button">
          Зарегистрироваться
        </button>
      </form>
    </AuthLayout>
  );
}
