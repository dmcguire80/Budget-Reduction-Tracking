/**
 * Dashboard Type Definitions
 *
 * TypeScript interfaces and types for dashboard components and data
 */

import React from 'react';

/**
 * Dashboard overview data
 */
export interface DashboardOverview {
  totalDebt: number;
  totalReduction: number;
  reductionPercentage: number;
  interestSaved: number;
  projectedDebtFreeDate: string | null;
  monthlyAverageReduction: number;
  trends: {
    debtChange: number;
    reductionChange: number;
    period: string;
  };
}

/**
 * Activity types
 */
export type ActivityType = 'transaction' | 'snapshot' | 'milestone';

/**
 * Activity item for recent activity feed
 */
export interface Activity {
  id: string;
  type: ActivityType;
  accountId?: string;
  accountName?: string;
  description: string;
  amount?: number;
  date: string;
  icon?: string;
}

/**
 * Progress information for a single account
 */
export interface AccountProgress {
  id: string;
  name: string;
  type: string;
  currentBalance: number;
  initialBalance: number;
  progress: number;
}

/**
 * Progress summary for all accounts
 */
export interface ProgressSummary {
  overallProgress: number;
  totalCurrentDebt: number;
  totalInitialDebt: number;
  accounts: AccountProgress[];
}

/**
 * Quick action item
 */
export interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  color?: string;
}

/**
 * Summary card props
 */
export interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  subtitle?: string;
  colorScheme?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

/**
 * Milestone achievement
 */
export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  date: string;
  isDismissible?: boolean;
}

/**
 * Stat comparison data
 */
export interface StatComparison {
  label: string;
  currentValue: number;
  previousValue: number;
  changePercentage: number;
  isPositive: boolean;
}

/**
 * Date range for dashboard filtering
 */
export interface DateRange {
  startDate: string | null;
  endDate: string | null;
  preset?: '1M' | '3M' | '6M' | '1Y' | 'ALL';
}
