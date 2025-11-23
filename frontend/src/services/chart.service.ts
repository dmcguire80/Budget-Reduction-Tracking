/**
 * Chart Service
 *
 * API calls for chart data and analytics
 */

import { get } from './api';
import {
  ChartData,
  DateRange,
  PaymentScenario,
  BalanceDataPoint,
  InterestDataPoint,
  PaymentDistribution,
  ProgressDataPoint,
  ProjectionDataPoint,
  UtilizationData,
} from '../types/chart.types';
import { Snapshot } from '../types';
import { format } from 'date-fns';

/**
 * API response types
 */
interface BalanceReductionResponse {
  data: {
    labels: string[];
    datasets: Array<{
      accountId: string;
      accountName: string;
      accountType: string;
      data: number[];
    }>;
    snapshots: Snapshot[];
  };
}

interface InterestForecastResponse {
  data: {
    labels: string[];
    scenarios: Array<{
      label: string;
      monthlyInterest: number[];
      cumulativeInterest: number[];
    }>;
  };
}

interface PaymentDistributionResponse {
  data: {
    principal: number;
    interest: number;
    fees?: number;
  };
}

interface ProgressResponse {
  data: {
    months: Array<{
      month: string;
      actual: number;
      target?: number;
    }>;
  };
}

interface ProjectionResponse {
  data: {
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
  };
}

interface UtilizationResponse {
  data: Array<{
    accountName: string;
    currentBalance: number;
    creditLimit: number;
    utilizationPercentage: number;
  }>;
}

/**
 * Get balance reduction chart data
 */
export async function getBalanceReductionData(
  accountIds?: string[],
  dateRange?: DateRange
): Promise<ChartData> {
  try {
    const params: Record<string, any> = {};

    if (accountIds && accountIds.length > 0) {
      params.accountIds = accountIds.join(',');
    }

    if (dateRange) {
      params.startDate = format(dateRange.startDate, 'yyyy-MM-dd');
      params.endDate = format(dateRange.endDate, 'yyyy-MM-dd');
    }

    const response = await get<BalanceReductionResponse>('/analytics/balance-reduction', {
      params,
    });

    const { labels, datasets } = response.data.data;

    return {
      labels,
      datasets: datasets.map((dataset) => ({
        label: dataset.accountName,
        data: dataset.data,
        borderColor: '', // Will be set by component
        backgroundColor: '', // Will be set by component
        fill: false,
        tension: 0.4,
      })),
    };
  } catch (error) {
    console.error('Error fetching balance reduction data:', error);
    throw error;
  }
}

/**
 * Get interest forecast chart data
 */
export async function getInterestForecast(
  accountId: string,
  months: number = 12
): Promise<{
  labels: string[];
  scenarios: Array<{
    label: string;
    monthlyInterest: number[];
    cumulativeInterest: number[];
  }>;
}> {
  try {
    const response = await get<InterestForecastResponse>(
      `/analytics/accounts/${accountId}/interest-forecast`,
      {
        params: { months },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('Error fetching interest forecast:', error);
    throw error;
  }
}

/**
 * Get payment distribution data
 */
export async function getPaymentDistribution(
  accountId?: string,
  dateRange?: DateRange
): Promise<PaymentDistribution> {
  try {
    const params: Record<string, any> = {};

    if (dateRange) {
      params.startDate = format(dateRange.startDate, 'yyyy-MM-dd');
      params.endDate = format(dateRange.endDate, 'yyyy-MM-dd');
    }

    const url = accountId
      ? `/analytics/accounts/${accountId}/payment-distribution`
      : '/analytics/payment-distribution';

    const response = await get<PaymentDistributionResponse>(url, { params });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching payment distribution:', error);
    throw error;
  }
}

/**
 * Get progress chart data
 */
export async function getProgressData(
  accountId?: string,
  months: number = 6
): Promise<ProgressDataPoint[]> {
  try {
    const params: Record<string, any> = { months };

    const url = accountId
      ? `/analytics/accounts/${accountId}/progress`
      : '/analytics/progress';

    const response = await get<ProgressResponse>(url, { params });

    return response.data.data.months;
  } catch (error) {
    console.error('Error fetching progress data:', error);
    throw error;
  }
}

/**
 * Get projection data with multiple scenarios
 */
export async function getProjection(
  accountId: string,
  scenarios?: PaymentScenario[]
): Promise<{
  scenarios: Array<{
    label: string;
    monthlyPayment: number;
    data: ProjectionDataPoint[];
    payoffMonths: number;
    totalInterest: number;
  }>;
}> {
  try {
    const response = await get<ProjectionResponse>(
      `/analytics/accounts/${accountId}/projection`,
      {
        params: scenarios
          ? { scenarios: JSON.stringify(scenarios) }
          : undefined,
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('Error fetching projection data:', error);
    throw error;
  }
}

/**
 * Get utilization data for credit cards
 */
export async function getUtilizationData(
  accountId?: string
): Promise<UtilizationData[]> {
  try {
    const url = accountId
      ? `/analytics/accounts/${accountId}/utilization`
      : '/analytics/utilization';

    const response = await get<UtilizationResponse>(url);

    return response.data.data;
  } catch (error) {
    console.error('Error fetching utilization data:', error);
    throw error;
  }
}

/**
 * Get snapshots for an account
 */
export async function getAccountSnapshots(
  accountId: string,
  dateRange?: DateRange
): Promise<Snapshot[]> {
  try {
    const params: Record<string, any> = {};

    if (dateRange) {
      params.startDate = format(dateRange.startDate, 'yyyy-MM-dd');
      params.endDate = format(dateRange.endDate, 'yyyy-MM-dd');
    }

    const response = await get<{ data: Snapshot[] }>(
      `/accounts/${accountId}/snapshots`,
      { params }
    );

    return response.data.data;
  } catch (error) {
    console.error('Error fetching account snapshots:', error);
    throw error;
  }
}

/**
 * Get chart-formatted data for an account
 */
export async function getAccountChartData(
  accountId: string,
  dateRange?: DateRange
): Promise<ChartData> {
  try {
    const params: Record<string, any> = {};

    if (dateRange) {
      params.startDate = format(dateRange.startDate, 'yyyy-MM-dd');
      params.endDate = format(dateRange.endDate, 'yyyy-MM-dd');
    }

    const response = await get<{ data: ChartData }>(
      `/accounts/${accountId}/snapshots/chart-data`,
      { params }
    );

    return response.data.data;
  } catch (error) {
    console.error('Error fetching account chart data:', error);
    throw error;
  }
}

export default {
  getBalanceReductionData,
  getInterestForecast,
  getPaymentDistribution,
  getProgressData,
  getProjection,
  getUtilizationData,
  getAccountSnapshots,
  getAccountChartData,
};
