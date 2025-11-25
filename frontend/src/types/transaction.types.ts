/**
 * Transaction Type Definitions
 *
 * TypeScript interfaces and types for transaction management
 */

/**
 * Transaction type enumeration
 */
export enum TransactionType {
  PAYMENT = 'PAYMENT',
  CHARGE = 'CHARGE',
  ADJUSTMENT = 'ADJUSTMENT',
  INTEREST = 'INTEREST',
}

/**
 * Transaction interface
 */
export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  transactionType: TransactionType;
  transactionDate: string;
  description: string | null;
  createdAt: string;
}

/**
 * Transaction form data interface
 */
export interface TransactionFormData {
  amount: number;
  transactionType: TransactionType;
  transactionDate: string | Date;
  description?: string | null;
}

/**
 * Transaction filters interface
 */
export interface TransactionFilters {
  transactionType?: TransactionType;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

/**
 * Transaction API response
 */
export interface TransactionResponse {
  transactions: Transaction[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Transaction with account info (for all transactions view)
 */
export interface TransactionWithAccount extends Transaction {
  account?: {
    id: string;
    name: string;
    accountType: string;
  };
}
