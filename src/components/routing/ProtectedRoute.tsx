import { Navigate, Outlet } from 'react-router-dom';

type ProtectedRouteProps = {
  isAuthenticated: boolean;
};

function getAuthenticationStatus() {
  return localStorage.getItem('isAuthenticated') === 'true';
}

export function ProtectedRoute({ isAuthenticated }: ProtectedRouteProps) {
  const currentAuthenticationStatus = getAuthenticationStatus();

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
