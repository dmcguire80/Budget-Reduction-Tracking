/**
 * Theme Context
 *
 * Global theme state management using React Context API
 * Supports light/dark mode with localStorage persistence
 */

import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

/**
 * Theme Context
 */
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme Provider Props
 */
interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = 'theme';

/**
 * Theme Provider Component
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize from localStorage or system preference
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  /**
   * Apply theme to document
   */
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Persist to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  /**
   * Toggle between light and dark
   */
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  /**
   * Set specific theme
   */
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;
