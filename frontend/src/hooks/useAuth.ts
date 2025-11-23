/**
 * useAuth Hook
 *
 * Custom hook to access authentication context
 */

import { useContext } from 'react';
import { AuthContext } from '@context/AuthContext';
import type { AuthContextType } from '@types/auth';

/**
 * Hook to access auth context
 * Throws error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;
