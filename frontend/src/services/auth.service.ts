/**
 * Authentication Service
 *
 * API service layer for authentication operations
 */

import { post } from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '@config/constants';
import { setTokens, clearTokens, getRefreshToken } from '@utils/token';
import { setItem, removeItem } from '@utils/storage';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshResponse,
  User,
} from '@/types/auth';

/**
 * Register a new user
 */
export const register = async (
  email: string,
  password: string,
  name: string
): Promise<User> => {
  const payload: RegisterRequest = {
    email,
    password,
    name,
  };

  const response = await post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, payload);
  const { user, tokens } = response.data;

  // Store tokens in localStorage
  setTokens(tokens.accessToken, tokens.refreshToken);

  // Store user data
  setItem(STORAGE_KEYS.USER, user);

  return user;
};

/**
 * Login user
 */
export const login = async (email: string, password: string): Promise<User> => {
  const payload: LoginRequest = {
    email,
    password,
  };

  const response = await post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, payload);
  const { user, tokens } = response.data;

  // Store tokens in localStorage
  setTokens(tokens.accessToken, tokens.refreshToken);

  // Store user data
  setItem(STORAGE_KEYS.USER, user);

  return user;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    // Optional: Call backend logout endpoint
    await post(API_ENDPOINTS.AUTH.LOGOUT);
  } catch (error) {
    // Continue with logout even if backend call fails
    console.error('Logout API call failed:', error);
  } finally {
    // Clear all auth data from localStorage
    clearTokens();
    removeItem(STORAGE_KEYS.USER);
  }
};

/**
 * Refresh access token
 */
export const refresh = async (): Promise<string> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await post<RefreshResponse>(API_ENDPOINTS.AUTH.REFRESH, {
    refreshToken,
  });

  const { accessToken } = response.data;

  // Update access token in localStorage
  setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

  return accessToken;
};

/**
 * Get current user from backend
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await post<User>(API_ENDPOINTS.AUTH.ME);
  const user = response.data;

  // Update user data in localStorage
  setItem(STORAGE_KEYS.USER, user);

  return user;
};

/**
 * Check if user is authenticated (has valid tokens)
 */
export const isAuthenticated = (): boolean => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

  return !!(accessToken && refreshToken);
};
