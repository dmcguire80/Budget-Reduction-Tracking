/**
 * API Service
 *
 * Configured Axios instance with interceptors for API calls
 */

import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_URL, API_TIMEOUT, STORAGE_KEYS, ERROR_MESSAGES } from '@config/constants';
import { getItem, removeItem } from '@utils/storage';
import type { ApiError } from '@types';

/**
 * Create Axios instance with base configuration
 */
const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - Add authentication token
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get access token from localStorage
    const token = getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);

    // Add token to headers if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors
 */
api.interceptors.response.use(
  (response) => {
    // Return the response data directly
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear auth data and redirect to login
          removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          removeItem(STORAGE_KEYS.USER);

          // Only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }

          return Promise.reject({
            message: data?.message || ERROR_MESSAGES.UNAUTHORIZED,
            statusCode: 401,
          });

        case 403:
          // Forbidden
          return Promise.reject({
            message: data?.message || ERROR_MESSAGES.FORBIDDEN,
            statusCode: 403,
          });

        case 404:
          // Not Found
          return Promise.reject({
            message: data?.message || ERROR_MESSAGES.NOT_FOUND,
            statusCode: 404,
          });

        case 422:
        case 400:
          // Validation Error
          return Promise.reject({
            message: data?.message || ERROR_MESSAGES.VALIDATION_ERROR,
            errors: data?.errors,
            statusCode: status,
          });

        case 500:
        case 502:
        case 503:
        case 504:
          // Server Error
          return Promise.reject({
            message: data?.message || ERROR_MESSAGES.SERVER_ERROR,
            statusCode: status,
          });

        default:
          return Promise.reject({
            message: data?.message || ERROR_MESSAGES.UNKNOWN_ERROR,
            statusCode: status,
          });
      }
    } else if (error.request) {
      // Network error (no response received)
      return Promise.reject({
        message: ERROR_MESSAGES.NETWORK_ERROR,
        statusCode: 0,
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
        statusCode: 0,
      });
    }
  }
);

/**
 * GET request
 */
export const get = <T>(url: string, config?: AxiosRequestConfig) => {
  return api.get<T>(url, config);
};

/**
 * POST request
 */
export const post = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
  return api.post<T>(url, data, config);
};

/**
 * PUT request
 */
export const put = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
  return api.put<T>(url, data, config);
};

/**
 * PATCH request
 */
export const patch = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
  return api.patch<T>(url, data, config);
};

/**
 * DELETE request
 */
export const del = <T>(url: string, config?: AxiosRequestConfig) => {
  return api.delete<T>(url, config);
};

/**
 * Export the configured axios instance
 */
export default api;
