import { TransactionType } from '@prisma/client';

/**
 * Transaction filter options for querying transactions
 */
export interface TransactionFilters {
  transactionType?: TransactionType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Transaction creation data
 */
export interface CreateTransactionData {
  amount: number;
  transactionType: TransactionType;
  transactionDate: Date;
  description?: string | null;
}

/**
 * Transaction update data
 */
export interface UpdateTransactionData {
  amount?: number;
  transactionType?: TransactionType;
  transactionDate?: Date;
  description?: string | null;
}
