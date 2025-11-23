/**
 * Chart Data Hooks
 *
 * React Query hooks for fetching and managing chart data
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  getBalanceReductionData,
  getInterestForecast,
  getPaymentDistribution,
  getProgressData,
  getProjection,
  getUtilizationData,
  getAccountSnapshots,
  getAccountChartData,
} from '../services/chart.service';
import {
  ChartData,
  DateRange,
  PaymentScenario,
  PaymentDistribution,
  ProgressDataPoint,
  UtilizationData,
} from '../types/chart.types';
import { Snapshot } from '../types';

/**
 * Hook to fetch balance reduction chart data
 */
export const useBalanceReductionData = (
  accountIds?: string[],
  dateRange?: DateRange
): UseQueryResult<ChartData, Error> => {
  return useQuery({
    queryKey: ['chart-balance-reduction', accountIds, dateRange],
    queryFn: () => getBalanceReductionData(accountIds, dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch interest forecast data
 */
export const useInterestForecastData = (
  accountId: string,
  months: number = 12,
  enabled: boolean = true
): UseQueryResult<{
  labels: string[];
  scenarios: Array<{
    label: string;
    monthlyInterest: number[];
    cumulativeInterest: number[];
  }>;
}, Error> => {
  return useQuery({
    queryKey: ['chart-interest-forecast', accountId, months],
    queryFn: () => getInterestForecast(accountId, months),
    enabled: enabled && !!accountId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch payment distribution data
 */
export const usePaymentDistributionData = (
  accountId?: string,
  dateRange?: DateRange
): UseQueryResult<PaymentDistribution, Error> => {
  return useQuery({
    queryKey: ['chart-payment-distribution', accountId, dateRange],
    queryFn: () => getPaymentDistribution(accountId, dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch progress chart data
 */
export const useProgressData = (
  accountId?: string,
  months: number = 6
): UseQueryResult<ProgressDataPoint[], Error> => {
  return useQuery({
    queryKey: ['chart-progress', accountId, months],
    queryFn: () => getProgressData(accountId, months),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch projection data with scenarios
 */
export const useProjectionData = (
  accountId: string,
  scenarios?: PaymentScenario[],
  enabled: boolean = true
): UseQueryResult<{
  scenarios: Array<{
    label: string;
    monthlyPayment: number;
    data: Array<{
      month: number;
      balance: number;
      isProjected: boolean;
    }>;
    payoffMonths: number;
    totalInterest: number;
  }>;
}, Error> => {
  return useQuery({
    queryKey: ['chart-projection', accountId, scenarios],
    queryFn: () => getProjection(accountId, scenarios),
    enabled: enabled && !!accountId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch utilization data
 */
export const useUtilizationData = (
  accountId?: string
): UseQueryResult<UtilizationData[], Error> => {
  return useQuery({
    queryKey: ['chart-utilization', accountId],
    queryFn: () => getUtilizationData(accountId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch account snapshots
 */
export const useAccountSnapshots = (
  accountId: string,
  dateRange?: DateRange,
  enabled: boolean = true
): UseQueryResult<Snapshot[], Error> => {
  return useQuery({
    queryKey: ['account-snapshots', accountId, dateRange],
    queryFn: () => getAccountSnapshots(accountId, dateRange),
    enabled: enabled && !!accountId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch account chart data (formatted for Chart.js)
 */
export const useAccountChartData = (
  accountId: string,
  dateRange?: DateRange,
  enabled: boolean = true
): UseQueryResult<ChartData, Error> => {
  return useQuery({
    queryKey: ['account-chart-data', accountId, dateRange],
    queryFn: () => getAccountChartData(accountId, dateRange),
    enabled: enabled && !!accountId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook for chart data with custom refetch interval
 */
export const useRealtimeChartData = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  refetchInterval: number = 60000 // 1 minute default
): UseQueryResult<T, Error> => {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: refetchInterval,
    refetchInterval,
    retry: 2,
  });
};
