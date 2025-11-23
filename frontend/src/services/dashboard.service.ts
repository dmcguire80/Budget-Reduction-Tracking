/**
 * Dashboard Service
 *
 * API service layer for dashboard operations and analytics
 */

import { get } from './api';
import { API_ENDPOINTS } from '@config/constants';
import type {
  DashboardOverview,
  Activity,
  ProgressSummary,
  AccountProgress,
} from '../types/dashboard.types';
import type { Transaction } from '../types/transaction.types';
import type { Account } from '../types/account.types';

/**
 * Fetch dashboard overview with key metrics
 */
export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const response = await get<{ overview: DashboardOverview }>(
    API_ENDPOINTS.ANALYTICS.OVERVIEW
  );
  return response.data.overview;
};

/**
 * Fetch recent activity (transactions, snapshots, milestones)
 */
export const getRecentActivity = async (limit = 10): Promise<Activity[]> => {
  try {
    // Fetch recent transactions
    const transactionsResponse = await get<{ transactions: Transaction[] }>(
      `${API_ENDPOINTS.TRANSACTIONS.ALL}?limit=${limit}`
    );

    // Fetch accounts to get account names
    const accountsResponse = await get<{ accounts: Account[] }>(
      API_ENDPOINTS.ACCOUNTS.LIST
    );

    const accounts = accountsResponse.data.accounts;
    const transactions = transactionsResponse.data.transactions;

    // Map transactions to activity items
    const activities: Activity[] = transactions.map((transaction) => {
      const account = accounts.find((acc) => acc.id === transaction.accountId);
      return {
        id: transaction.id,
        type: 'transaction' as const,
        accountId: transaction.accountId,
        accountName: account?.name || 'Unknown Account',
        description: transaction.description || `${transaction.transactionType} transaction`,
        amount: transaction.amount,
        date: transaction.transactionDate,
      };
    });

    // Sort by date (most recent first)
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return activities.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};

/**
 * Fetch progress summary for all accounts
 */
export const getProgressSummary = async (): Promise<ProgressSummary> => {
  try {
    const response = await get<{ accounts: Account[] }>(API_ENDPOINTS.ACCOUNTS.LIST);
    const accounts = response.data.accounts;

    if (accounts.length === 0) {
      return {
        overallProgress: 0,
        totalCurrentDebt: 0,
        totalInitialDebt: 0,
        accounts: [],
      };
    }

    // Calculate progress for each account
    const accountsProgress: AccountProgress[] = await Promise.all(
      accounts.map(async (account) => {
        try {
          // Fetch account summary to get initial balance
          const summaryResponse = await get<{
            account: Account;
            analytics: {
              totalPayments: number;
              totalCharges: number;
              totalReduction: number;
              progressPercentage: number;
            };
          }>(API_ENDPOINTS.ACCOUNTS.SUMMARY(account.id));

          const analytics = summaryResponse.data.analytics;
          const initialBalance =
            account.currentBalance + analytics.totalReduction;

          return {
            id: account.id,
            name: account.name,
            type: account.accountType,
            currentBalance: account.currentBalance,
            initialBalance: initialBalance > 0 ? initialBalance : account.currentBalance,
            progress: analytics.progressPercentage,
          };
        } catch (error) {
          console.error(`Error fetching summary for account ${account.id}:`, error);
          // Fallback to basic calculation
          return {
            id: account.id,
            name: account.name,
            type: account.accountType,
            currentBalance: account.currentBalance,
            initialBalance: account.currentBalance,
            progress: 0,
          };
        }
      })
    );

    // Calculate overall progress
    const totalCurrentDebt = accountsProgress.reduce(
      (sum, acc) => sum + acc.currentBalance,
      0
    );
    const totalInitialDebt = accountsProgress.reduce(
      (sum, acc) => sum + acc.initialBalance,
      0
    );
    const overallProgress =
      totalInitialDebt > 0
        ? ((totalInitialDebt - totalCurrentDebt) / totalInitialDebt) * 100
        : 0;

    return {
      overallProgress: Math.max(0, Math.min(100, overallProgress)),
      totalCurrentDebt,
      totalInitialDebt,
      accounts: accountsProgress,
    };
  } catch (error) {
    console.error('Error fetching progress summary:', error);
    return {
      overallProgress: 0,
      totalCurrentDebt: 0,
      totalInitialDebt: 0,
      accounts: [],
    };
  }
};

/**
 * Export all dashboard service functions
 */
export default {
  getDashboardOverview,
  getRecentActivity,
  getProgressSummary,
};
