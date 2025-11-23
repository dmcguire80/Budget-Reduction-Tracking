/**
 * Authentication Type Definitions
 *
 * TypeScript types and interfaces for authentication functionality
 */

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * Authentication tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Authentication response from server
 */
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

/**
 * Refresh token response
 */
export interface RefreshResponse {
  accessToken: string;
}

/**
 * Auth context state type
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

/**
 * Password strength level
 */
export enum PasswordStrength {
  WEAK = 'weak',
  MEDIUM = 'medium',
  STRONG = 'strong',
  VERY_STRONG = 'very_strong',
}

/**
 * Password strength result
 */
export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number;
  requirements: {
    minLength: boolean;
    hasNumber: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasSpecialChar: boolean;
  };
}
