import { Outlet, useLocation } from 'react-router-dom';
import { Header, MobileNavigation } from '@/components/app';
import { cn } from '@/lib/utils';

function getAuthenticationStatus() {
  return typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') === 'true';
}

export function MainLayout() {
  const location = useLocation();
  const isAuthenticated = getAuthenticationStatus();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isMainCatalogPage = location.pathname === '/' || location.pathname.startsWith('/catalog');
  const isCatalogFiltersPage = location.pathname === '/catalog/filters';
  const isProfilePage = location.pathname.startsWith('/profile');
  const isProductPage = location.pathname.startsWith('/products/');
  const isOrderFlowPage = location.pathname === '/checkout' || location.pathname === '/success';
  const showAuthenticatedNavigation = isAuthPage || isMainCatalogPage || isProfilePage || isProductPage || isOrderFlowPage || isAuthenticated;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header isAuthenticated={showAuthenticatedNavigation} />
      <main
        className={cn(
          'mx-auto w-full max-w-[1440px]',
          isAuthPage ? 'p-0' : isCatalogFiltersPage ? 'px-5 pt-5 pb-5 md:px-[130px] md:py-8' : 'px-5 pt-5 pb-24 md:px-[130px] md:py-8',
        )}
      >
        <Outlet />
      </main>
      {isAuthPage || isCatalogFiltersPage ? null : <MobileNavigation isAuthenticated={showAuthenticatedNavigation} />}
    </div>
  );
}
