/**
 * Payment Distribution Chart
 *
 * Pie/Doughnut chart showing breakdown of principal, interest, and fees
 */

import React, { useState, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { PaymentDistributionChartProps, DateRange } from '../../types/chart.types';
import { usePaymentDistributionData } from '../../hooks/useChartData';
import { getPieChartOptions, DEFAULT_CHART_COLORS } from '../../config/chartDefaults';
import { formatCurrencyLabel } from '../../utils/chart.utils';
import ChartLoadingSkeleton, { CompactChartLoadingSkeleton } from './ChartLoadingSkeleton';
import ChartEmptyState from './ChartEmptyState';
import ChartExport from './ChartExport';
import DateRangeSelector from './DateRangeSelector';

export const PaymentDistributionChart: React.FC<PaymentDistributionChartProps> = ({
  accountId,
  dateRange: initialDateRange,
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(initialDateRange);
  const chartId = 'payment-distribution-chart';

  // Fetch distribution data
  const { data, isLoading, error } = usePaymentDistributionData(accountId, dateRange);

  /**
   * Transform data for doughnut chart
   */
  const chartData = useMemo(() => {
    if (!data) {
      return null;
    }

    const labels: string[] = [];
    const values: number[] = [];
    const colors: string[] = [];

    // Add principal
    if (data.principal > 0) {
      labels.push('Principal');
      values.push(data.principal);
      colors.push(DEFAULT_CHART_COLORS.success); // Green for principal
    }

    // Add interest
    if (data.interest > 0) {
      labels.push('Interest');
      values.push(data.interest);
      colors.push(DEFAULT_CHART_COLORS.danger); // Red for interest
    }

    // Add fees if present
    if (data.fees && data.fees > 0) {
      labels.push('Fees');
      values.push(data.fees);
      colors.push(DEFAULT_CHART_COLORS.warning); // Amber for fees
    }

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderColor: colors.map((c) => c),
          borderWidth: 2,
          hoverOffset: 10,
        },
      ],
    };
  }, [data]);

  /**
   * Calculate total and percentages
   */
  const stats = useMemo(() => {
    if (!data) return null;

    const total = data.principal + data.interest + (data.fees || 0);
    const principalPct = (data.principal / total) * 100;
    const interestPct = (data.interest / total) * 100;
    const feesPct = data.fees ? (data.fees / total) * 100 : 0;

    return {
      total,
      principalPct,
      interestPct,
      feesPct,
    };
  }, [data]);

  /**
   * Chart options with center text
   */
  const options = useMemo(() => {
    return getPieChartOptions({
      plugins: {
        title: {
          display: true,
          text: 'Payment Distribution',
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${formatCurrencyLabel(value)} (${percentage}%)`;
            },
          },
        },
        legend: {
          display: true,
          position: 'bottom' as const,
        },
      },
      cutout: '60%', // Make it a doughnut chart
    });
  }, []);

  /**
   * Handle loading state
   */
  if (isLoading) {
    return <CompactChartLoadingSkeleton height={400} />;
  }

  /**
   * Handle error state
   */
  if (error) {
    return (
      <ChartEmptyState
        message="Error loading distribution"
        description={(error as Error).message || 'Failed to load payment distribution data'}
        height={400}
      />
    );
  }

  /**
   * Handle empty state
   */
  if (!chartData || !data) {
    return (
      <ChartEmptyState
        message="No payment data"
        description="No payments recorded for the selected period."
        height={400}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <DateRangeSelector
            value={dateRange}
            onChange={setDateRange}
            presets={['1M', '3M', '6M', '1Y', 'ALL']}
          />
        </div>
        <div className="ml-4">
          <ChartExport chartId={chartId} fileName="payment-distribution" formats={['png', 'jpeg']} />
        </div>
      </div>

      {/* Chart and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart */}
        <div id={chartId} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div style={{ height: '350px' }} className="relative">
            <Doughnut data={chartData} options={options} />
            {/* Center text */}
            {stats && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrencyLabel(stats.total)}
                  </div>
                  <div className="text-sm text-gray-500">Total Paid</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Breakdown */}
        {stats && data && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Breakdown</h3>
            <div className="space-y-4">
              {/* Principal */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: DEFAULT_CHART_COLORS.success }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">Principal</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrencyLabel(data.principal)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stats.principalPct.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Interest */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: DEFAULT_CHART_COLORS.danger }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">Interest</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrencyLabel(data.interest)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stats.interestPct.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Fees (if present) */}
              {data.fees && data.fees > 0 && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: DEFAULT_CHART_COLORS.warning }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">Fees</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrencyLabel(data.fees)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stats.feesPct.toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">Total</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrencyLabel(stats.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-sm text-gray-600">
        <p>
          Green represents principal payments (reducing your debt), while red shows interest
          charged. A higher green percentage means more of your payments are going toward
          reducing your actual debt.
        </p>
      </div>
    </div>
  );
};

export default PaymentDistributionChart;
