import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';

const profileNavigation = [
  { label: 'Профиль', to: '/profile', end: true },
  { label: 'Редактирование', to: '/profile/edit' },
  { label: 'История заказов', to: '/profile/orders' },
  { label: 'Корзина', to: '/profile/cart' },
];

export function ProfileLayout() {
  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <nav aria-label="Навигация профиля" className="flex flex-col gap-2">
        {profileNavigation.map(({ label, to, end }) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-2 text-sm font-medium',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
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
      <Outlet />
    </div>
  );
}
