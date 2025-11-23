/**
 * Type Definitions Index
 *
 * Central export point for all TypeScript types and interfaces
 */

// API Types
export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  FilterParams,
} from './api';

// Common Types
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type InputType = 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local' | 'time';
export type AlertType = 'success' | 'danger' | 'warning' | 'info';

/**
 * Common UI component props
 */
export interface BaseComponentProps {
  className?: string;
  id?: string;
}

/**
 * Loading state
 */
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

/**
 * User type (placeholder - will be expanded by Auth agent)
 */
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Account types (placeholder - will be expanded by Accounts agent)
 */
export enum AccountType {
  CREDIT_CARD = 'CREDIT_CARD',
  PERSONAL_LOAN = 'PERSONAL_LOAN',
  AUTO_LOAN = 'AUTO_LOAN',
  MORTGAGE = 'MORTGAGE',
  STUDENT_LOAN = 'STUDENT_LOAN',
  OTHER = 'OTHER',
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  accountType: AccountType;
  currentBalance: number;
  creditLimit?: number;
  interestRate: number;
  minimumPayment?: number;
  dueDay?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transaction types (placeholder - will be expanded by Transactions agent)
 */
export enum TransactionType {
  PAYMENT = 'PAYMENT',
  CHARGE = 'CHARGE',
  ADJUSTMENT = 'ADJUSTMENT',
  INTEREST = 'INTEREST',
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  transactionType: TransactionType;
  transactionDate: string;
  description?: string;
  createdAt: string;
}

/**
 * Snapshot type (placeholder)
 */
export interface Snapshot {
  id: string;
  accountId: string;
  balance: number;
  snapshotDate: string;
  note?: string;
  createdAt: string;
}

/**
 * Chart data types (placeholder - will be expanded by Charts agent)
 */
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}
