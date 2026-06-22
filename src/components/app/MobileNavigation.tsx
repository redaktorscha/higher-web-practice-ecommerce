import { Link } from 'react-router-dom';
import { Button, Icon, type IconName } from '@/components/ui';
import { cn } from '@/lib/utils';

type MobileNavigationProps = {
  isAuthenticated?: boolean;
  className?: string;
};

const navItems: Array<{ icon: IconName; label: string; to: string }> = [
  { icon: 'home', label: 'Главная', to: '/' },
  { icon: 'filter', label: 'Товары', to: '/catalog' },
  { icon: 'user', label: 'Профиль', to: '/profile' },
  { icon: 'shoppingBag', label: 'Корзина', to: '/cart' },
];

function MobileNavigation({ isAuthenticated = true, className }: MobileNavigationProps) {
  return (
    <nav className={cn('fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card md:hidden', className)}>
      {isAuthenticated ? (
        <div className="grid h-[58px] grid-cols-4 px-5 py-2">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className="flex flex-col items-center justify-center gap-1 rounded-md px-1 text-xs leading-4 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid h-[58px] grid-cols-[42px_1fr] items-center gap-4 px-5 py-2">
          <Link to="/login" className="flex flex-col items-center gap-1 text-xs leading-4">
            <Icon name="user" size={16} />
            Войти
          </Link>
          <Button size="mobile" asChild>
            <Link to="/register">Зарегистрироваться</Link>
          </Button>
        </div>
      )}
    </nav>
  );
}

export { MobileNavigation };
