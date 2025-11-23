/**
 * Balance Reduction Chart
 *
 * Line chart showing balance over time with inverted visualization
 * (debt reduction shown as upward trend)
 */

import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { BalanceReductionChartProps, DateRange } from '../../types/chart.types';
import { useBalanceReductionData, useAccounts } from '../../hooks/useChartData';
import { getLineChartOptions } from '../../config/chartDefaults';
import { getChartColors, formatCurrencyLabel } from '../../utils/chart.utils';
import ChartLoadingSkeleton from './ChartLoadingSkeleton';
import ChartEmptyState from './ChartEmptyState';
import ChartExport from './ChartExport';
import DateRangeSelector from './DateRangeSelector';

export const BalanceReductionChart: React.FC<BalanceReductionChartProps> = ({
  accountIds,
  dateRange: initialDateRange,
  inversionStrategy = 'reduction',
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(initialDateRange);
  const chartId = 'balance-reduction-chart';

  // Fetch chart data
  const { data, isLoading, error } = useBalanceReductionData(accountIds, dateRange);

  /**
   * Transform data based on inversion strategy
   */
  const chartData = useMemo(() => {
    if (!data || !data.datasets || data.datasets.length === 0) {
      return null;
    }

    const colors = getChartColors(data.datasets.length);

    if (inversionStrategy === 'reduction') {
      // Option 1: Show reduction amount (initial - current)
      // This makes upward trend = more reduction = good
      const transformedDatasets = data.datasets.map((dataset, index) => {
        const firstValue = dataset.data[0] || 0;
        const reductionData = dataset.data.map((value) => firstValue - value);

        return {
          ...dataset,
          label: `${dataset.label} - Reduction`,
          data: reductionData,
          borderColor: colors[index],
          backgroundColor: colors[index] + '20',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        };
      });

      return {
        labels: data.labels,
        datasets: transformedDatasets,
      };
    } else {
      // Option 2: Use inverted Y-axis (handled in chart options)
      const transformedDatasets = data.datasets.map((dataset, index) => ({
        ...dataset,
        borderColor: colors[index],
        backgroundColor: colors[index] + '20',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      }));

      return {
        labels: data.labels,
        datasets: transformedDatasets,
      };
    }
  }, [data, inversionStrategy]);

  /**
   * Chart options
   */
  const options = useMemo(() => {
    const baseOptions = getLineChartOptions({
      plugins: {
        title: {
          display: true,
          text: inversionStrategy === 'reduction' ? 'Balance Reduction Over Time' : 'Balance Over Time',
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return `${label}: ${formatCurrencyLabel(value)}`;
            },
          },
        },
      },
      scales: {
        y: {
          reverse: inversionStrategy === 'inverted-axis', // Invert Y-axis if using this strategy
          ticks: {
            callback: (value: any) => formatCurrencyLabel(value),
          },
          title: {
            display: true,
            text: inversionStrategy === 'reduction' ? 'Amount Reduced' : 'Balance',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Date',
          },
        },
      },
    });

    return baseOptions;
  }, [inversionStrategy]);

  /**
   * Handle loading state
   */
  if (isLoading) {
    return <ChartLoadingSkeleton height={400} />;
  }

  /**
   * Handle error state
   */
  if (error) {
    return (
      <ChartEmptyState
        message="Error loading chart"
        description={(error as Error).message || 'Failed to load balance reduction data'}
        height={400}
      />
    );
  }

  /**
   * Handle empty state
   */
  if (!chartData || chartData.datasets.length === 0) {
    return (
      <ChartEmptyState
        message="No data available"
        description="Start adding transactions to see your balance reduction progress."
        actionLabel="Add Transaction"
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
          <ChartExport chartId={chartId} fileName="balance-reduction" formats={['png', 'jpeg']} />
        </div>
      </div>

      {/* Chart */}
      <div id={chartId} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div style={{ height: '400px' }}>
          <Line data={chartData} options={options} />
        </div>
      </div>

      {/* Legend/Info */}
      <div className="text-sm text-gray-600">
        {inversionStrategy === 'reduction' ? (
          <p>
            This chart shows your debt reduction progress. An upward trend indicates you're
            successfully reducing your debt.
          </p>
        ) : (
          <p>
            This chart shows your balance over time. A downward trend indicates you're
            successfully reducing your debt.
          </p>
        )}
      </div>
    </div>
  );
};

export default BalanceReductionChart;
