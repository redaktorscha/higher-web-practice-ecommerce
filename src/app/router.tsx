import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { ProtectedRoute } from '@/components/routing';
import {
  CartPage,
  CatalogPage,
  CheckoutPage,
  HomePage,
  LoginPage,
  NotFoundPage,
  OrderHistoryPage,
  ProductPage,
  ProfileEditPage,
  ProfileLayout,
  ProfilePage,
  RegisterPage,
  SuccessPage,
} from '@/pages';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'catalog',
        element: <CatalogPage />,
      },
      {
        path: 'catalog/filters',
        element: <HomePage />,
      },
      {
        element: <ProtectedRoute isAuthenticated={false} />,
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          },
          {
            path: 'register',
            element: <RegisterPage />,
          },
        ],
      },
      {
        path: 'products/:id',
        element: <ProductPage />,
      },
      {
        element: <ProtectedRoute isAuthenticated />,
        children: [
          {
            path: 'profile',
            element: <ProfileLayout />,
            children: [
              {
                index: true,
                element: <ProfilePage />,
                handle: { illustration: 'meditation' },
              },
              {
                path: 'edit',
                element: <ProfileEditPage />,
                handle: { illustration: 'meditation' },
              },
              {
                path: 'orders',
                element: <OrderHistoryPage />,
              },
              {
                path: 'cart',
                element: <CartPage />,
                handle: { illustration: 'shopping' },
              },
            ],
          },
          {
            path: 'checkout',
            element: <CheckoutPage />,
          },
          {
            path: 'success',
            element: <SuccessPage />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}