import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '../components/layout';
import { StubPage } from '../pages/_StubPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [{ index: true, element: <StubPage title="UI-kit приложения" /> }],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
