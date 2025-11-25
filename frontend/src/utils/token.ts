/**
 * Token Management Utilities
 *
 * Functions for managing JWT tokens in localStorage
 */

import { STORAGE_KEYS } from '@config/constants';
import { getItem, setItem, removeItem } from './storage';

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * Set tokens in localStorage
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
};

/**
 * Clear all tokens from localStorage
 */
export const clearTokens = (): void => {
  removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  removeItem(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * Decode JWT token payload
 * Note: This does NOT verify the signature - use only for reading claims
 */
export const decodeToken = (token: string): Record<string, unknown> | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const expirationTime = (decoded.exp as number) * 1000; // Convert to milliseconds
  const currentTime = Date.now();

  return currentTime >= expirationTime;
};

/**
 * Check if token is about to expire (within 5 minutes)
 */
export const isTokenExpiringSoon = (token: string, thresholdMinutes: number = 5): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const expirationTime = (decoded.exp as number) * 1000;
  const currentTime = Date.now();
  const threshold = thresholdMinutes * 60 * 1000; // Convert to milliseconds

  return expirationTime - currentTime <= threshold;
};

/**
 * Get token expiration time as Date object
 */
export const getTokenExpiration = (token: string): Date | null => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }

  return new Date((decoded.exp as number) * 1000);
};
