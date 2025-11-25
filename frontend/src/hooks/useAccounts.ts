/**
 * Account Hooks
 *
 * React Query hooks for account operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import accountService from '@services/account.service';
import type { AccountFilters, AccountFormData } from '@/types/account.types';

/**
 * Fetch all accounts with optional filters
 */
export const useAccounts = (filters?: AccountFilters) => {
  return useQuery({
    queryKey: ['accounts', filters],
    queryFn: () => accountService.getAccounts(filters),
  });
};

/**
 * Fetch a single account by ID
 */
export const useAccount = (id: string) => {
  return useQuery({
    queryKey: ['account', id],
    queryFn: () => accountService.getAccount(id),
    enabled: !!id,
  });
};

/**
 * Fetch account summary with analytics
 */
export const useAccountSummary = (id: string) => {
  return useQuery({
    queryKey: ['account-summary', id],
    queryFn: () => accountService.getAccountSummary(id),
    enabled: !!id,
  });
};

/**
 * Create a new account
 */
export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AccountFormData) => accountService.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

/**
 * Update an existing account
 */
export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AccountFormData> }) =>
      accountService.updateAccount(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['account', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['account-summary', variables.id] });
    },
  });
};

/**
 * Delete an account
 */
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => accountService.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};
