/**
 * Transaction Service
 *
 * API service for transaction management
 */

import { get, post, put, del } from './api';
import { API_ENDPOINTS } from '@config/constants';
import type {
  Transaction,
  TransactionFormData,
  TransactionFilters,
} from '@/types/transaction.types';

/**
 * Get transactions for a specific account
 */
export const getAccountTransactions = async (
  accountId: string,
  filters?: TransactionFilters
): Promise<Transaction[]> => {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.transactionType) {
      params.append('transactionType', filters.transactionType);
    }
    if (filters.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate);
    }
    if (filters.limit !== undefined) {
      params.append('limit', filters.limit.toString());
    }
    if (filters.offset !== undefined) {
      params.append('offset', filters.offset.toString());
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
  }

  const queryString = params.toString();
  const url = queryString
    ? `${API_ENDPOINTS.TRANSACTIONS.LIST(accountId)}?${queryString}`
    : API_ENDPOINTS.TRANSACTIONS.LIST(accountId);

  const response = await get<Transaction[]>(url);
  return response.data;
};

/**
 * Get all transactions across all accounts
 */
export const getAllTransactions = async (
  filters?: TransactionFilters
): Promise<Transaction[]> => {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.transactionType) {
      params.append('transactionType', filters.transactionType);
    }
    if (filters.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate);
    }
    if (filters.limit !== undefined) {
      params.append('limit', filters.limit.toString());
    }
    if (filters.offset !== undefined) {
      params.append('offset', filters.offset.toString());
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
  }

  const queryString = params.toString();
  const url = queryString
    ? `${API_ENDPOINTS.TRANSACTIONS.ALL}?${queryString}`
    : API_ENDPOINTS.TRANSACTIONS.ALL;

  const response = await get<Transaction[]>(url);
  return response.data;
};

/**
 * Create a new transaction
 */
export const createTransaction = async (
  accountId: string,
  data: TransactionFormData
): Promise<Transaction> => {
  const response = await post<Transaction>(
    API_ENDPOINTS.TRANSACTIONS.CREATE(accountId),
    data
  );
  return response.data;
};

/**
 * Update an existing transaction
 */
export const updateTransaction = async (
  id: string,
  data: Partial<TransactionFormData>
): Promise<Transaction> => {
  const response = await put<Transaction>(
    API_ENDPOINTS.TRANSACTIONS.UPDATE(id),
    data
  );
  return response.data;
};

/**
 * Delete a transaction
 */
export const deleteTransaction = async (id: string): Promise<void> => {
  await del(API_ENDPOINTS.TRANSACTIONS.DELETE(id));
};

/**
 * Export all transaction service methods
 */
const transactionService = {
  getAccountTransactions,
  getAllTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};

export default transactionService;
