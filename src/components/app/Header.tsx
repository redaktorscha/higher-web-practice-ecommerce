import { Link } from 'react-router-dom';
import { Button, Icon } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { SearchField } from './SearchField';

type HeaderProps = {
  isAuthenticated?: boolean;
  profileName?: string;
  className?: string;
};

function Header({ isAuthenticated = true, profileName = 'Имя профиля', className }: HeaderProps) {
  return (
    <header className={cn('sticky top-0 z-40 hidden h-16 border-b border-border bg-card md:block', className)}>
      <div className="mx-auto grid h-full max-w-[1440px] grid-cols-[280px_minmax(320px,568px)_292px] items-center gap-5 px-[130px]">
        <div className="flex items-center gap-[51px]">
          <Logo />
          <Button asChild>
            <Link to="/catalog">Каталог</Link>
          </Button>
        </div>

        <SearchField />

        <div className="flex justify-end">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <HeaderAction icon="user" label={profileName} to="/profile" />
              <HeaderAction icon="shoppingBag" label="Корзина" to="/cart" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="secondary" asChild>
                <Link to="/login">Войти</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Регистрация</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

type HeaderActionProps = {
  icon: 'user' | 'shoppingBag';
  label: string;
  to: string;
};

function HeaderAction({ icon, label, to }: HeaderActionProps) {
  return (
    <Link to={to} className="flex min-w-[55px] flex-col items-center gap-0.5 rounded-md p-1 text-xs leading-4 text-foreground outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">
      <Icon name={icon} />
      <span className="max-w-[86px] truncate">{label}</span>
    </Link>
  );
}

export { Header };
