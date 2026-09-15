import { Link } from 'react-router-dom';
import { Button, Icon } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { SearchField } from './SearchField';

type HeaderProps = {
  isAuthenticated?: boolean;
  profileName?: string;
  cartTotalItems?: number;
  className?: string;
  onSearch?: (value: string) => void;
};

function Header({ isAuthenticated = true, profileName = 'Имя профиля', cartTotalItems = 0, className, onSearch }: HeaderProps) {
  return (
    <header className={cn('sticky top-0 z-40 hidden h-16 border-b border-border bg-card md:block', className)}>
      <div className="mx-auto grid h-full max-w-[1440px] grid-cols-[280px_minmax(320px,568px)_292px] items-center gap-5 px-[130px]">
        <div className="flex items-center gap-[51px]">
          <Logo />
          <Button asChild>
            <Link to="/catalog">Каталог</Link>
          </Button>
        </div>

        <SearchField onSearch={onSearch} />

        <div className="flex justify-end">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <HeaderAction icon="user" label={profileName} to="/profile" />
              <HeaderAction count={cartTotalItems} icon="shoppingBag" label="Корзина" to="/profile/cart" />
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
  count?: number;
  icon: 'user' | 'shoppingBag';
  label: string;
  to: string;
};

function HeaderAction({ count = 0, icon, label, to }: HeaderActionProps) {
  return (
    <Link to={to} className="flex min-w-[55px] cursor-pointer flex-col items-center gap-0.5 rounded-md p-1 text-xs leading-4 text-foreground outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">
      <span className="relative">
        <Icon name={icon} />
        {count > 0 ? (
          <span className="absolute -top-1 -right-2 grid min-h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] leading-4 font-bold text-white">
            {count}
          </span>
        ) : null}
      </span>
      <span className="max-w-[86px] truncate">{label}</span>
    </Link>
  );
}

export { Header };
