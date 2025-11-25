import { Account, AccountType } from '@prisma/client';

/**
 * Account filter options for querying accounts
 */
export interface AccountFilters {
  accountType?: AccountType;
  isActive?: boolean;
  sortBy?: 'name' | 'balance' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Account summary with analytics data
 */
export interface AccountSummary {
  account: Account;
  analytics: {
    totalPayments: number;
    totalCharges: number;
    totalReduction: number;
    progressPercentage: number;
    averageMonthlyReduction: number;
    projectedDebtFreeDate: Date | null;
  };
}

/**
 * Account creation data
 */
export interface CreateAccountData {
  name: string;
  accountType: AccountType;
  currentBalance: number;
  creditLimit?: number | null;
  interestRate: number;
  minimumPayment?: number | null;
  dueDay?: number | null;
}

/**
 * Account update data
 */
export interface UpdateAccountData {
  name?: string;
  accountType?: AccountType;
  currentBalance?: number;
  creditLimit?: number | null;
  interestRate?: number;
  minimumPayment?: number | null;
  dueDay?: number | null;
  isActive?: boolean;
}
