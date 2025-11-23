/**
 * Authentication Context
 *
 * Global authentication state management using React Context API
 */

import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '@services/auth.service';
import { getItem } from '@utils/storage';
import { STORAGE_KEYS, ROUTES } from '@config/constants';
import { isTokenExpired } from '@utils/token';
import type { User, AuthContextType } from '@types/auth';

/**
 * Auth Context
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user data exists in localStorage
        const storedUser = getItem<User>(STORAGE_KEYS.USER);
        const accessToken = getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);

        if (storedUser && accessToken) {
          // Check if token is expired
          if (isTokenExpired(accessToken)) {
            // Try to refresh the token
            try {
              await authService.refresh();
              // Get fresh user data
              const currentUser = await authService.getCurrentUser();
              setUser(currentUser);
            } catch (error) {
              // Refresh failed, clear auth data
              console.error('Token refresh failed:', error);
              await authService.logout();
              setUser(null);
            }
          } else {
            // Token is still valid, set user from localStorage
            setUser(storedUser);
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login function
   */
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      try {
        const loggedInUser = await authService.login(email, password);
        setUser(loggedInUser);
        navigate(ROUTES.DASHBOARD);
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    [navigate]
  );

  /**
   * Register function
   */
  const register = useCallback(
    async (email: string, password: string, name: string): Promise<void> => {
      try {
        const registeredUser = await authService.register(email, password, name);
        setUser(registeredUser);
        navigate(ROUTES.DASHBOARD);
      } catch (error) {
        console.error('Registration failed:', error);
        throw error;
      }
    },
    [navigate]
  );

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear user state and redirect even if API call fails
      setUser(null);
      navigate(ROUTES.LOGIN);
    }
  }, [navigate]);

  /**
   * Refresh token function
   */
  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      await authService.refresh();
      // Optionally refresh user data
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  }, [logout]);

  /**
   * Context value
   */
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
