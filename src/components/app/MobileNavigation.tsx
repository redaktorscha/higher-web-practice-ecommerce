import { Link, NavLink, useLocation } from 'react-router-dom';
import { Button, Icon, type IconName } from '@/components/ui';
import { cn } from '@/lib/utils';

type MobileNavigationProps = {
  isAuthenticated?: boolean;
  className?: string;
};

const navItems: Array<{ icon: IconName; label: string; to: string; end?: boolean }> = [
  { icon: 'home', label: 'Главная', to: '/', end: true },
  { icon: 'menu', label: 'Товары', to: '/catalog' },
  { icon: 'user', label: 'Профиль', to: '/profile' },
  { icon: 'shoppingBag', label: 'Корзина', to: '/profile/cart' },
];

function MobileNavigation({ isAuthenticated = true, className }: MobileNavigationProps) {
  const location = useLocation();

  const isItemActive = (to: string, end?: boolean) => {
    if (to === '/profile') {
      return location.pathname.startsWith('/profile') && location.pathname !== '/profile/cart';
    }

    if (to === '/profile/cart') {
      return ['/profile/cart', '/checkout', '/success'].includes(location.pathname);
    }

    return end ? location.pathname === to : location.pathname.startsWith(to);
  };

  return (
    <nav className={cn('fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card md:hidden', className)}>
      {isAuthenticated ? (
        <div className="grid h-[58px] grid-cols-4 px-5 py-2">
          {navItems.map((item) => (
            <Link
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md px-1 text-xs leading-4 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring',
                isItemActive(item.to, item.end) ? 'text-primary-hover' : 'text-foreground',
              )}
              key={item.to}
              to={item.to}
            >
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid h-[58px] grid-cols-[42px_1fr] items-center gap-4 px-5 py-2">
          <NavLink to="/login" className="flex cursor-pointer flex-col items-center gap-1 text-xs leading-4">
            <Icon name="user" size={16} />
            Войти
          </NavLink>
          <Button size="mobile" asChild>
            <NavLink to="/register">Зарегистрироваться</NavLink>
          </Button>
        </div>
      )}
    </nav>
  );
}

export { MobileNavigation };
