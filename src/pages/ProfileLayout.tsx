import { NavLink, Outlet, useMatches } from 'react-router-dom';
import { cn } from '@/lib/utils';
import meditationImage from '@/assets/meditation.png';
import shoppingImage from '@/assets/shopping.png';

const profileNavigation = [
  { label: 'Мой профиль', to: '/profile', end: true },
  { label: 'История заказов', to: '/profile/orders' },
  { label: 'Корзина', to: '/profile/cart' },
];

type ProfileIllustration = 'meditation' | 'shopping';

interface ProfileRouteHandle {
  illustration?: ProfileIllustration;
}

const illustrations: Record<ProfileIllustration, string> = {
  meditation: meditationImage,
  shopping: shoppingImage,
};

export function ProfileLayout() {
  const matches = useMatches();
  // Роут для текущего пути может быть вложен на несколько уровней — ищем
  // handle.illustration среди всех совпавших матчей (обычно он будет только
  // у самого глубокого, "листового" роута).
  const illustrationKey = matches
    .map((match) => (match.handle as ProfileRouteHandle | undefined)?.illustration)
    .find((illustration): illustration is ProfileIllustration => Boolean(illustration));
  const illustrationSrc = illustrationKey ? illustrations[illustrationKey] : null;

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

      <section className="min-h-[800px] md:relative">
        <div className="relative z-10">
          <Outlet />
        </div>

        {illustrationSrc ? (
          <img
            alt=""
            className="pointer-events-none absolute right-0 bottom-0 hidden h-[550px] w-[550px] object-contain md:block"
            src={illustrationSrc}
          />
        ) : null}
      </section>
    </div>
  );
}