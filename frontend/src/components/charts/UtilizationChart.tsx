/**
 * Utilization Chart
 *
 * Horizontal bar or gauge chart showing credit utilization percentage
 */

import React, { useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { UtilizationChartProps } from '../../types/chart.types';
import { useUtilizationData } from '../../hooks/useChartData';
import { getBarChartOptions, getPieChartOptions } from '../../config/chartDefaults';
import { getColorForUtilization, formatCurrencyLabel, formatPercentageLabel } from '../../utils/chart.utils';
import ChartLoadingSkeleton, { CompactChartLoadingSkeleton } from './ChartLoadingSkeleton';
import ChartEmptyState from './ChartEmptyState';
import ChartExport from './ChartExport';

export const UtilizationChart: React.FC<UtilizationChartProps> = ({
  accountId,
  displayType = 'bar',
}) => {
  const chartId = 'utilization-chart';

  // Fetch utilization data
  const { data, isLoading, error } = useUtilizationData(accountId);

  /**
   * Transform data for bar chart (horizontal)
   */
  const barChartData = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }

    const labels = data.map((d) => d.accountName);
    const percentages = data.map((d) => d.utilizationPercentage);
    const colors = percentages.map((pct) => getColorForUtilization(pct));

    return {
      labels,
      datasets: [
        {
          label: 'Utilization %',
          data: percentages,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  /**
   * Transform data for gauge chart (single account)
   */
  const gaugeChartData = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }

    const account = data[0]; // Single account
    const utilized = account.utilizationPercentage;
    const remaining = 100 - utilized;
    const color = getColorForUtilization(utilized);

    return {
      labels: ['Utilized', 'Available'],
      datasets: [
        {
          data: [utilized, remaining],
          backgroundColor: [color, '#e5e7eb'], // Color and gray
          borderColor: [color, '#e5e7eb'],
          borderWidth: 2,
        },
      ],
    };
  }, [data]);

  /**
   * Bar chart options (horizontal)
   */
  const barOptions = useMemo(() => {
    return getBarChartOptions({
      indexAxis: 'y' as const, // Horizontal bar
      plugins: {
        title: {
          display: true,
          text: 'Credit Utilization',
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const index = context.dataIndex;
              const accountData = data?.[index];
              if (!accountData) return '';

              return [
                `Utilization: ${formatPercentageLabel(accountData.utilizationPercentage)}`,
                `Balance: ${formatCurrencyLabel(accountData.currentBalance)}`,
                `Limit: ${formatCurrencyLabel(accountData.creditLimit)}`,
              ];
            },
          },
        },
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value: any) => `${value}%`,
          },
          title: {
            display: true,
            text: 'Utilization Percentage',
          },
        },
        y: {
          title: {
            display: false,
          },
        },
      },
    });
  }, [data]);

  /**
   * Gauge chart options
   */
  const gaugeOptions = useMemo(() => {
    return getPieChartOptions({
      plugins: {
        title: {
          display: true,
          text: 'Credit Utilization',
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = context.parsed;
              return `${label}: ${formatPercentageLabel(value)}`;
            },
          },
        },
        legend: {
          display: false,
        },
      },
      cutout: '70%', // Gauge style
      circumference: 180, // Half circle
      rotation: -90, // Start from left
    });
  }, []);

  /**
   * Handle loading state
   */
  if (isLoading) {
    return displayType === 'gauge' ? (
      <CompactChartLoadingSkeleton height={300} />
    ) : (
      <ChartLoadingSkeleton height={400} />
    );
  }

  /**
   * Handle error state
   */
  if (error) {
    return (
      <ChartEmptyState
        message="Error loading utilization"
        description={(error as Error).message || 'Failed to load utilization data'}
        height={displayType === 'gauge' ? 300 : 400}
      />
    );
  }

  /**
   * Handle empty state
   */
  if (!data || data.length === 0) {
    return (
      <ChartEmptyState
        message="No credit accounts"
        description="Add credit card accounts to track utilization."
        height={displayType === 'gauge' ? 300 : 400}
      />
    );
  }

  /**
   * Render gauge chart (for single account)
   */
  if (displayType === 'gauge' && data.length > 0) {
    const account = data[0];
    const chartData = gaugeChartData;

    if (!chartData) return null;

    return (
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex justify-end">
          <ChartExport chartId={chartId} fileName="utilization" formats={['png', 'jpeg']} />
        </div>

        {/* Chart */}
        <div id={chartId} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div style={{ height: '300px' }} className="relative">
            <Doughnut data={chartData} options={gaugeOptions} />
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center" style={{ marginTop: '50px' }}>
                <div className="text-4xl font-bold" style={{ color: getColorForUtilization(account.utilizationPercentage) }}>
                  {formatPercentageLabel(account.utilizationPercentage)}
                </div>
                <div className="text-sm text-gray-500 mt-1">Utilization</div>
              </div>
            </div>
          </div>

          {/* Account details */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Current Balance</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrencyLabel(account.currentBalance)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Credit Limit</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrencyLabel(account.creditLimit)}
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="text-sm text-gray-600">
          <p>
            <strong className="text-green-600">Good:</strong> Under 30% utilization.{' '}
            <strong className="text-yellow-600">Fair:</strong> 30-70%.{' '}
            <strong className="text-red-600">High:</strong> Over 70%.
          </p>
        </div>
      </div>
    );
  }

  /**
   * Render bar chart (for multiple accounts)
   */
  if (displayType === 'bar' && barChartData) {
    return (
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex justify-end">
          <ChartExport chartId={chartId} fileName="utilization" formats={['png', 'jpeg']} />
        </div>

        {/* Chart */}
        <div id={chartId} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div style={{ height: `${Math.max(300, data.length * 60)}px` }}>
            <Bar data={barChartData} options={barOptions} />
          </div>
        </div>

        {/* Account details table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Limit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilization
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((account, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {account.accountName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrencyLabel(account.currentBalance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrencyLabel(account.creditLimit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: getColorForUtilization(account.utilizationPercentage) + '20',
                        color: getColorForUtilization(account.utilizationPercentage),
                      }}
                    >
                      {formatPercentageLabel(account.utilizationPercentage)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Info */}
        <div className="text-sm text-gray-600">
          <p>
            Credit utilization is the percentage of your available credit that you're using.
            Keeping it below 30% is generally recommended for maintaining a good credit score.
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default UtilizationChart;
