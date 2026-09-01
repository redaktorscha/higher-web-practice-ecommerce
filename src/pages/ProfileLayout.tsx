import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';

const profileNavigation = [
  { label: 'Мой профиль', to: '/profile', end: true },
  { label: 'История заказов', to: '/profile/orders' },
  { label: 'Корзина', to: '/profile/cart' },
];

export function ProfileLayout() {
  return (
    <div className="md:grid md:grid-cols-[280px_minmax(0,1fr)] md:gap-5 md:pt-2">
      <aside className="hidden h-[656px] border-r border-border pr-4 md:block">
        <nav aria-label="Навигация профиля" className="grid gap-2">
          {profileNavigation.map(({ label, to, end }) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'h-10 rounded-md px-4 py-2 text-base leading-6 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
                  isActive ? 'bg-muted text-primary-hover' : 'text-foreground',
                )
              }
              end={end}
              key={to}
              to={to}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <Outlet />
    </div>
  );
}
