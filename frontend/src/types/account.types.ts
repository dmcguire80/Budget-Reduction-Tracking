/**
 * Account Type Definitions
 *
 * TypeScript interfaces and types for account management
 */

import { Account, AccountType } from './index';

/**
 * Account form data for creating/updating accounts
 */
export interface AccountFormData {
  name: string;
  accountType: AccountType;
  currentBalance: number;
  creditLimit?: number | null;
  interestRate: number;
  minimumPayment?: number | null;
  dueDay?: number | null;
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
  };
}

/**
 * Account filter parameters
 */
export interface AccountFilters {
  accountType?: AccountType;
  isActive?: boolean;
  search?: string;
  sortBy?: 'name' | 'balance' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Account API responses
 */
export interface AccountListResponse {
  accounts: Account[];
  total: number;
}

export interface AccountResponse {
  account: Account;
}

export interface AccountSummaryResponse {
  account: Account;
  analytics: {
    totalPayments: number;
    totalCharges: number;
    totalReduction: number;
    progressPercentage: number;
    averageMonthlyReduction: number;
  };
}

export interface AccountDeleteResponse {
  message: string;
}

/**
 * Account type option for dropdowns
 */
export interface AccountTypeOption {
  value: AccountType;
  label: string;
  icon: string;
}

/**
 * Account status badge variant
 */
export type AccountStatusVariant = 'active' | 'inactive';

/**
 * Re-export Account and AccountType for convenience
 */
export type { Account, AccountType };
