import { Outlet, useLocation } from 'react-router-dom';
import { Header, MobileNavigation } from '@/components/app';
import { cn } from '@/lib/utils';
import { useGetProfileQuery } from '@/store/api';
import { selectCurrentUser, selectIsAuthenticated, selectToken } from '@/store/authSlice';
import { useSelector } from 'react-redux';

export function MainLayout() {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token = useSelector(selectToken);
  const user = useSelector(selectCurrentUser);
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isCatalogFiltersPage = location.pathname === '/catalog/filters';
  const profileName = user ? `${user.firstName} ${user.lastName}` : undefined;

  useGetProfileQuery(undefined, {
    skip: !token,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header isAuthenticated={isAuthenticated} profileName={profileName} />
      <main
        className={cn(
          'mx-auto w-full max-w-[1440px]',
          isAuthPage ? 'p-0' : isCatalogFiltersPage ? 'px-5 pt-5 pb-5 md:px-[130px] md:py-8' : 'px-5 pt-5 pb-24 md:px-[130px] md:py-8',
        )}
      >
        <Outlet />
      </main>
      {isAuthPage || isCatalogFiltersPage ? null : <MobileNavigation isAuthenticated={isAuthenticated} />}
    </div>
  );
}
