/**
 * Application Constants
 *
 * Central location for all application-wide constants
 */

// Environment variables
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Budget Reduction Tracker';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
export const ENV_LABEL = import.meta.env.VITE_ENV_LABEL || '';
export const IS_DEBUG = import.meta.env.VITE_DEBUG === 'true';
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
  },
  // Accounts
  ACCOUNTS: {
    LIST: '/api/accounts',
    DETAIL: (id: string) => `/api/accounts/${id}`,
    CREATE: '/api/accounts',
    UPDATE: (id: string) => `/api/accounts/${id}`,
    DELETE: (id: string) => `/api/accounts/${id}`,
    SUMMARY: (id: string) => `/api/accounts/${id}/summary`,
  },
  // Transactions
  TRANSACTIONS: {
    LIST: (accountId: string) => `/api/accounts/${accountId}/transactions`,
    CREATE: (accountId: string) => `/api/accounts/${accountId}/transactions`,
    UPDATE: (id: string) => `/api/transactions/${id}`,
    DELETE: (id: string) => `/api/transactions/${id}`,
    ALL: '/api/transactions',
  },
  // Snapshots
  SNAPSHOTS: {
    LIST: (accountId: string) => `/api/accounts/${accountId}/snapshots`,
    CREATE: (accountId: string) => `/api/accounts/${accountId}/snapshots`,
    DELETE: (id: string) => `/api/snapshots/${id}`,
    CHART_DATA: (accountId: string) => `/api/accounts/${accountId}/snapshots/chart-data`,
  },
  // Analytics
  ANALYTICS: {
    OVERVIEW: '/api/analytics/overview',
    PROJECTION: (accountId: string) => `/api/analytics/accounts/${accountId}/projection`,
    INTEREST_FORECAST: '/api/analytics/interest-forecast',
    PAYOFF_SCENARIOS: '/api/analytics/payoff-scenarios',
    TRENDS: '/api/analytics/trends',
  },
} as const;

// React Query keys
export const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'],
  },
  ACCOUNTS: {
    LIST: ['accounts'],
    DETAIL: (id: string) => ['accounts', id],
    SUMMARY: (id: string) => ['accounts', id, 'summary'],
  },
  TRANSACTIONS: {
    LIST: (accountId: string) => ['transactions', accountId],
    ALL: ['transactions'],
    DETAIL: (id: string) => ['transactions', id],
  },
  SNAPSHOTS: {
    LIST: (accountId: string) => ['snapshots', accountId],
    CHART_DATA: (accountId: string) => ['snapshots', accountId, 'chart-data'],
  },
  ANALYTICS: {
    OVERVIEW: ['analytics', 'overview'],
    PROJECTION: (accountId: string) => ['analytics', 'projection', accountId],
    INTEREST_FORECAST: ['analytics', 'interest-forecast'],
    PAYOFF_SCENARIOS: ['analytics', 'payoff-scenarios'],
    TRENDS: ['analytics', 'trends'],
  },
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'budget_tracker_access_token',
  REFRESH_TOKEN: 'budget_tracker_refresh_token',
  USER: 'budget_tracker_user',
  THEME: 'budget_tracker_theme',
  PREFERENCES: 'budget_tracker_preferences',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/',
  ACCOUNTS: '/accounts',
  ACCOUNT_DETAIL: (id: string) => `/accounts/${id}`,
  TRANSACTIONS: '/transactions',
  ANALYTICS: '/analytics',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOT_FOUND: '/404',
} as const;

// Account types
export const ACCOUNT_TYPES = [
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'PERSONAL_LOAN', label: 'Personal Loan' },
  { value: 'AUTO_LOAN', label: 'Auto Loan' },
  { value: 'MORTGAGE', label: 'Mortgage' },
  { value: 'STUDENT_LOAN', label: 'Student Loan' },
  { value: 'OTHER', label: 'Other' },
] as const;

// Transaction types
export const TRANSACTION_TYPES = [
  { value: 'PAYMENT', label: 'Payment' },
  { value: 'CHARGE', label: 'Charge' },
  { value: 'ADJUSTMENT', label: 'Adjustment' },
  { value: 'INTEREST', label: 'Interest' },
] as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_LONG: 'MMMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy hh:mm a',
  INPUT: 'yyyy-MM-dd',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// Validation constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Currency
export const CURRENCY = {
  CODE: 'USD',
  SYMBOL: '$',
  LOCALE: 'en-US',
} as const;

// Chart colors
export const CHART_COLORS = {
  PRIMARY: 'rgb(59, 130, 246)',
  SUCCESS: 'rgb(34, 197, 94)',
  DANGER: 'rgb(239, 68, 68)',
  WARNING: 'rgb(245, 158, 11)',
  INFO: 'rgb(14, 165, 233)',
  SECONDARY: 'rgb(100, 116, 139)',
  PALETTE: [
    'rgb(59, 130, 246)',
    'rgb(34, 197, 94)',
    'rgb(239, 68, 68)',
    'rgb(245, 158, 11)',
    'rgb(14, 165, 233)',
    'rgb(168, 85, 247)',
    'rgb(236, 72, 153)',
    'rgb(20, 184, 166)',
  ],
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized. Please log in.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  LOGOUT: 'Successfully logged out!',
  REGISTER: 'Account created successfully!',
  ACCOUNT_CREATED: 'Account created successfully!',
  ACCOUNT_UPDATED: 'Account updated successfully!',
  ACCOUNT_DELETED: 'Account deleted successfully!',
  TRANSACTION_CREATED: 'Transaction created successfully!',
  TRANSACTION_UPDATED: 'Transaction updated successfully!',
  TRANSACTION_DELETED: 'Transaction deleted successfully!',
} as const;
