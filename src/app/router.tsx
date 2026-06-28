import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { ProtectedRoute } from '@/components/routing';
import { NotFoundPage, ProfileLayout, StubPage } from '@/pages';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <StubPage title="Главная страница" />,
      },
      {
        element: <ProtectedRoute isAuthenticated={false} />,
        children: [
          {
            path: 'login',
            element: <StubPage title="Авторизация" />,
          },
          {
            path: 'register',
            element: <StubPage title="Регистрация" />,
          },
        ],
      },
      {
        element: <ProtectedRoute isAuthenticated />,
        children: [
          {
            path: 'products/:slug',
            element: <StubPage title="Карточка товара" />,
          },
          {
            path: 'profile',
            element: <ProfileLayout />,
            children: [
              {
                index: true,
                element: <StubPage title="Личный кабинет" />,
              },
              {
                path: 'edit',
                element: <StubPage title="Редактирование профиля" />,
              },
              {
                path: 'orders',
                element: <StubPage title="История заказов" />,
              },
              {
                path: 'cart',
                element: <StubPage title="Корзина покупок" />,
              },
            ],
          },
          {
            path: 'checkout',
            element: <StubPage title="Оформление заказа" />,
          },
          {
            path: 'success',
            element: <StubPage title="Заказ подтвержден" />,
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
