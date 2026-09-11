import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/store/authSlice';

type ProtectedRouteProps = {
  isAuthenticated: boolean;
};

export function ProtectedRoute({ isAuthenticated }: ProtectedRouteProps) {
  const currentAuthenticationStatus = useSelector(selectIsAuthenticated);

  if (currentAuthenticationStatus !== isAuthenticated) {
    return (
      <Navigate
        replace
        to={currentAuthenticationStatus ? '/profile' : '/login'}
      />
    );
  }

  return <Outlet />;
}
