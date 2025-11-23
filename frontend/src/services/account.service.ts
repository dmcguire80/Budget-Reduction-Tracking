/**
 * Account Service
 *
 * API service layer for account operations
 */

import { get, post, put, del } from './api';
import { API_ENDPOINTS } from '@config/constants';
import type {
  Account,
  AccountFormData,
  AccountFilters,
  AccountListResponse,
  AccountResponse,
  AccountSummaryResponse,
  AccountDeleteResponse,
} from '@types/account.types';

/**
 * Fetch all user accounts with optional filters
 */
export const getAccounts = async (filters?: AccountFilters): Promise<Account[]> => {
  const params = new URLSearchParams();

  if (filters?.accountType) {
    params.append('accountType', filters.accountType);
  }
  if (filters?.isActive !== undefined) {
    params.append('isActive', String(filters.isActive));
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }
  if (filters?.sortBy) {
    params.append('sortBy', filters.sortBy);
  }
  if (filters?.sortOrder) {
    params.append('sortOrder', filters.sortOrder);
  }

  const queryString = params.toString();
  const url = queryString
    ? `${API_ENDPOINTS.ACCOUNTS.LIST}?${queryString}`
    : API_ENDPOINTS.ACCOUNTS.LIST;

  const response = await get<AccountListResponse>(url);
  return response.data.accounts;
};

/**
 * Fetch a single account by ID
 */
export const getAccount = async (id: string): Promise<Account> => {
  const response = await get<AccountResponse>(API_ENDPOINTS.ACCOUNTS.DETAIL(id));
  return response.data.account;
};

/**
 * Create a new account
 */
export const createAccount = async (data: AccountFormData): Promise<Account> => {
  const response = await post<AccountResponse>(API_ENDPOINTS.ACCOUNTS.CREATE, data);
  return response.data.account;
};

/**
 * Update an existing account
 */
export const updateAccount = async (
  id: string,
  data: Partial<AccountFormData>
): Promise<Account> => {
  const response = await put<AccountResponse>(API_ENDPOINTS.ACCOUNTS.UPDATE(id), data);
  return response.data.account;
};

/**
 * Delete an account
 */
export const deleteAccount = async (id: string): Promise<string> => {
  const response = await del<AccountDeleteResponse>(API_ENDPOINTS.ACCOUNTS.DELETE(id));
  return response.data.message;
};

/**
 * Get account summary with analytics
 */
export const getAccountSummary = async (id: string): Promise<AccountSummaryResponse> => {
  const response = await get<AccountSummaryResponse>(API_ENDPOINTS.ACCOUNTS.SUMMARY(id));
  return response.data;
};

/**
 * Export all account service functions
 */
export default {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountSummary,
};
