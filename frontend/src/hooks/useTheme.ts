/**
 * useTheme Hook
 *
 * Custom hook to access theme context
 */

import { useContext } from 'react';
import { ThemeContext } from '@context/ThemeContext';
import type { ThemeContextType } from '@context/ThemeContext';

/**
 * Hook to access theme context
 * Throws error if used outside ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

export default useTheme;
