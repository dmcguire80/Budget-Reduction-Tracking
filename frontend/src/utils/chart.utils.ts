/**
 * Chart Utility Functions
 *
 * Helper functions for chart data transformation, color generation,
 * label formatting, and other chart-related operations
 */

import { format, parseISO } from 'date-fns';
import type { AccountType, Snapshot } from '../types';
import type {
  ChartData,
  ChartDataset,
  BalanceDataPoint,
  ProgressDataPoint,
} from '../types/chart.types';
import {
  CHART_COLOR_ARRAY,
  ACCOUNT_TYPE_COLORS,
  UTILIZATION_COLORS,
} from '../config/chartDefaults';

/**
 * Generate an array of colors for multiple datasets
 */
export function getChartColors(count: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(CHART_COLOR_ARRAY[i % CHART_COLOR_ARRAY.length]);
  }
  return colors;
}

/**
 * Get color for a specific account type
 */
export function getAccountColor(accountType: AccountType): string {
  return ACCOUNT_TYPE_COLORS[accountType] || ACCOUNT_TYPE_COLORS.OTHER;
}

/**
 * Get color based on credit utilization percentage
 */
export function getColorForUtilization(percentage: number): string {
  if (percentage < 30) {
    return UTILIZATION_COLORS.low;
  } else if (percentage <= 70) {
    return UTILIZATION_COLORS.medium;
  } else {
    return UTILIZATION_COLORS.high;
  }
}

/**
 * Transform snapshots to chart data for balance reduction
 */
export function transformToChartData(
  snapshots: Snapshot[],
  _initialBalance?: number
): ChartData {
  if (!snapshots || snapshots.length === 0) {
    return { labels: [], datasets: [] };
  }

  // Sort snapshots by date
  const sorted = [...snapshots].sort(
    (a, b) =>
      new Date(a.snapshotDate).getTime() - new Date(b.snapshotDate).getTime()
  );

  const labels = sorted.map((s) => formatDateLabel(parseISO(s.snapshotDate), 'short'));
  const balances = sorted.map((s) => s.balance);

  const dataset: ChartDataset = {
    label: 'Balance',
    data: balances,
    borderColor: CHART_COLOR_ARRAY[0],
    backgroundColor: CHART_COLOR_ARRAY[0] + '20',
    fill: true,
    tension: 0.4,
    pointRadius: 4,
    pointHoverRadius: 6,
  };

  return {
    labels,
    datasets: [dataset],
  };
}

/**
 * Calculate reduction data (inverted visualization)
 * Shows reduction amount instead of balance for upward trend
 */
export function calculateReductionData(
  snapshots: Snapshot[],
  initialBalance: number
): number[] {
  return snapshots.map((snapshot) => initialBalance - snapshot.balance);
}

/**
 * Aggregate data by time period
 */
export function aggregateByPeriod<T extends { date: string; value: number }>(
  data: T[],
  period: 'day' | 'week' | 'month'
): T[] {
  if (period === 'day') {
    return data; // No aggregation needed
  }

  const aggregated: Record<string, T> = {};

  data.forEach((item) => {
    const date = parseISO(item.date);
    let key: string;

    if (period === 'week') {
      // Get the start of the week
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = format(weekStart, 'yyyy-MM-dd');
    } else {
      // month
      key = format(date, 'yyyy-MM');
    }

    if (!aggregated[key]) {
      aggregated[key] = { ...item, date: key };
    } else {
      // Average the values for the period
      aggregated[key] = {
        ...aggregated[key],
        value: (aggregated[key].value + item.value) / 2,
      };
    }
  });

  return Object.values(aggregated);
}

/**
 * Format date label for chart display
 */
export function formatDateLabel(
  date: Date,
  formatType: 'short' | 'long' = 'short'
): string {
  if (formatType === 'short') {
    return format(date, 'MMM dd');
  } else {
    return format(date, 'MMM dd, yyyy');
  }
}

/**
 * Format currency label for chart display
 */
export function formatCurrencyLabel(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage label for chart display
 */
export function formatPercentageLabel(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
}

/**
 * Format compact currency (K, M notation)
 */
export function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  } else {
    return formatCurrencyLabel(amount);
  }
}

/**
 * Generate dataset for multiple accounts
 */
export function generateMultiAccountDatasets(
  accountData: Array<{
    accountId: string;
    accountName: string;
    accountType: AccountType;
    snapshots: Snapshot[];
  }>
): ChartDataset[] {
  return accountData.map((account, _index) => {
    const sorted = [...account.snapshots].sort(
      (a, b) =>
        new Date(a.snapshotDate).getTime() - new Date(b.snapshotDate).getTime()
    );

    const color = getAccountColor(account.accountType);

    return {
      label: account.accountName,
      data: sorted.map((s) => s.balance),
      borderColor: color,
      backgroundColor: color + '20',
      fill: false,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5,
    };
  });
}

/**
 * Calculate trend line data using linear regression
 */
export function calculateTrendLine(data: number[]): number[] {
  const n = data.length;
  if (n === 0) return [];

  const xSum = (n * (n - 1)) / 2;
  const ySum = data.reduce((sum, val) => sum + val, 0);
  const xySum = data.reduce((sum, val, idx) => sum + val * idx, 0);
  const xxSum = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
  const intercept = (ySum - slope * xSum) / n;

  return data.map((_, idx) => slope * idx + intercept);
}

/**
 * Create gradient fill for area charts
 */
export function createGradient(
  ctx: CanvasRenderingContext2D,
  color: string
): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color + '40');
  gradient.addColorStop(1, color + '00');
  return gradient;
}

/**
 * Get date range from preset
 */
export function getDateRangeFromPreset(preset: string): {
  startDate: Date;
  endDate: Date;
} {
  const endDate = new Date();
  const startDate = new Date();

  switch (preset) {
    case '1M':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case '3M':
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case '6M':
      startDate.setMonth(endDate.getMonth() - 6);
      break;
    case '1Y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case 'ALL':
      startDate.setFullYear(2000, 0, 1); // Far past date
      break;
    default:
      startDate.setMonth(endDate.getMonth() - 6); // Default 6M
  }

  return { startDate, endDate };
}

/**
 * Filter snapshots by date range
 */
export function filterByDateRange(
  snapshots: Snapshot[],
  startDate: Date,
  endDate: Date
): Snapshot[] {
  return snapshots.filter((snapshot) => {
    const snapshotDate = parseISO(snapshot.snapshotDate);
    return snapshotDate >= startDate && snapshotDate <= endDate;
  });
}

/**
 * Generate month labels for projection charts
 */
export function generateMonthLabels(months: number): string[] {
  const labels: string[] = [];
  const now = new Date();

  for (let i = 0; i <= months; i++) {
    const date = new Date(now);
    date.setMonth(now.getMonth() + i);
    labels.push(format(date, 'MMM yyyy'));
  }

  return labels;
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(
  oldValue: number,
  newValue: number
): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}

/**
 * Generate dashed line style for projected data
 */
export function getProjectedLineStyle(): number[] {
  return [5, 5]; // 5px dash, 5px gap
}

/**
 * Convert hex color to rgba
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get lighter shade of a color
 */
export function getLighterShade(color: string, amount: number = 0.2): string {
  return color + Math.round(amount * 255).toString(16).padStart(2, '0');
}

/**
 * Sort and prepare balance data points
 */
export function prepareBalanceDataPoints(
  snapshots: Snapshot[]
): BalanceDataPoint[] {
  return snapshots
    .map((snapshot) => ({
      date: snapshot.snapshotDate,
      balance: snapshot.balance,
      reduction: 0, // Will be calculated if initial balance is known
    }))
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
}

/**
 * Calculate monthly reduction amounts
 */
export function calculateMonthlyReduction(
  snapshots: Snapshot[]
): ProgressDataPoint[] {
  const sorted = [...snapshots].sort(
    (a, b) =>
      new Date(a.snapshotDate).getTime() - new Date(b.snapshotDate).getTime()
  );

  const monthlyData: Record<string, { start: number; end: number }> = {};

  sorted.forEach((snapshot) => {
    const monthKey = format(parseISO(snapshot.snapshotDate), 'MMM yyyy');

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { start: snapshot.balance, end: snapshot.balance };
    } else {
      monthlyData[monthKey].end = snapshot.balance;
    }
  });

  return Object.entries(monthlyData).map(([month, { start, end }]) => ({
    month,
    actual: start - end,
  }));
}

/**
 * Interpolate missing data points
 */
export function interpolateData(
  data: number[],
  targetLength: number
): number[] {
  if (data.length === 0 || targetLength <= data.length) {
    return data;
  }

  const result: number[] = [];
  const step = (data.length - 1) / (targetLength - 1);

  for (let i = 0; i < targetLength; i++) {
    const index = i * step;
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);
    const fraction = index - lowerIndex;

    if (lowerIndex === upperIndex) {
      result.push(data[lowerIndex]);
    } else {
      const interpolated =
        data[lowerIndex] * (1 - fraction) + data[upperIndex] * fraction;
      result.push(interpolated);
    }
  }

  return result;
}
