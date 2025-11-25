/**
 * useRequireAuth Hook
 *
 * Hook to require authentication - redirects to login if not authenticated
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { ROUTES } from '@config/constants';

/**
 * Hook to require authentication
 * Redirects to login page if user is not authenticated
 * Stores intended destination for redirect after login
 */
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the intended destination
      const from = location.pathname + location.search;

      // Redirect to login with the intended destination
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: { from },
      });
    }
  }, [isLoading, isAuthenticated, navigate, location]);

  return { isAuthenticated, isLoading };
};

export default useRequireAuth;
