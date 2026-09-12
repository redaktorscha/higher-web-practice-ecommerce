import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Header, MobileNavigation } from '@/components/app';
import { cn } from '@/lib/utils';
import { useGetCartQuery, useGetProfileQuery } from '@/store/api';
import { selectCurrentUser, selectIsAuthenticated, selectToken } from '@/store/authSlice';
import { selectCartTotalItems } from '@/store/cartSlice';

export function MainLayout() {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token = useSelector(selectToken);
  const user = useSelector(selectCurrentUser);
  const cartTotalItems = useSelector(selectCartTotalItems);
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isCatalogFiltersPage = location.pathname === '/catalog/filters';
  const profileName = user ? `${user.firstName} ${user.lastName}` : undefined;

  useGetProfileQuery(undefined, {
    skip: !token,
  });

  useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header isAuthenticated={isAuthenticated} profileName={profileName} cartTotalItems={cartTotalItems} />
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
