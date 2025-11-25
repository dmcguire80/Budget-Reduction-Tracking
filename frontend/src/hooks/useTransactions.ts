/**
 * Transaction Hooks
 *
 * React Query hooks for transaction management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import transactionService from '@services/transaction.service';
import type { TransactionFormData, TransactionFilters } from '@/types/transaction.types';

/**
 * Hook to fetch transactions for a specific account
 */
export const useAccountTransactions = (accountId: string, filters?: TransactionFilters) => {
  return useQuery({
    queryKey: ['transactions', accountId, filters],
    queryFn: () => transactionService.getAccountTransactions(accountId, filters),
    enabled: !!accountId,
  });
};

/**
 * Hook to fetch all transactions across all accounts
 */
export const useAllTransactions = (filters?: TransactionFilters) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionService.getAllTransactions(filters),
  });
};

/**
 * Hook to create a new transaction
 */
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountId, data }: { accountId: string; data: TransactionFormData }) =>
      transactionService.createTransaction(accountId, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.accountId] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts', variables.accountId] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

/**
 * Hook to update an existing transaction
 */
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TransactionFormData> }) =>
      transactionService.updateTransaction(id, data),
    onSuccess: () => {
      // Invalidate all transaction and account queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

/**
 * Hook to delete a transaction
 */
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionService.deleteTransaction(id),
    onSuccess: () => {
      // Invalidate all transaction and account queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};
