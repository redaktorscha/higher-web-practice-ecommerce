import { Outlet } from 'react-router-dom';
import { Header, MobileNavigation } from '@/components/app';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-[1440px] px-5 pt-5 pb-24 md:px-[130px] md:py-8">
        <Outlet />
      </main>
      <MobileNavigation />
    </div>
  );
}
