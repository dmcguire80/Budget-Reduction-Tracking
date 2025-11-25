/**
 * Protected Route Component
 *
 * Wrapper component for routes that require authentication
 * Redirects to login if user is not authenticated
 */

import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { ROUTES } from '@config/constants';

export interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Protected Route Component
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the intended destination for redirect after login
    const from = location.pathname + location.search;

    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from }}
        replace
      />
    );
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
