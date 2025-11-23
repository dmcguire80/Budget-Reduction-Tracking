/**
 * Progress Chart
 *
 * Bar chart showing monthly reduction with actual vs. target comparison
 */

import React, { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { ProgressChartProps } from '../../types/chart.types';
import { useProgressData } from '../../hooks/useChartData';
import { getBarChartOptions, DEFAULT_CHART_COLORS } from '../../config/chartDefaults';
import { formatCurrencyLabel, calculateTrendLine } from '../../utils/chart.utils';
import ChartLoadingSkeleton from './ChartLoadingSkeleton';
import ChartEmptyState from './ChartEmptyState';
import ChartExport from './ChartExport';

export const ProgressChart: React.FC<ProgressChartProps> = ({
  accountId,
  months = 6,
  targetAmount,
}) => {
  const [timelineMonths, setTimelineMonths] = useState(months);
  const chartId = 'progress-chart';

  // Fetch progress data
  const { data, isLoading, error } = useProgressData(accountId, timelineMonths);

  /**
   * Transform data for chart
   */
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }

    const labels = data.map((d) => d.month);
    const actualData = data.map((d) => d.actual);

    // Determine bar colors based on target
    const barColors = targetAmount
      ? actualData.map((value) =>
          value >= targetAmount
            ? DEFAULT_CHART_COLORS.success // Green if meets/exceeds target
            : DEFAULT_CHART_COLORS.danger // Red if below target
        )
      : actualData.map(() => DEFAULT_CHART_COLORS.primary); // Blue if no target

    const datasets = [
      {
        label: 'Actual Reduction',
        data: actualData,
        backgroundColor: barColors,
        borderColor: barColors,
        borderWidth: 1,
      },
    ];

    // Add target line if specified
    if (targetAmount) {
      datasets.push({
        label: 'Target',
        data: new Array(data.length).fill(targetAmount),
        backgroundColor: 'transparent',
        borderColor: DEFAULT_CHART_COLORS.warning,
        borderWidth: 2,
        borderDash: [5, 5],
        type: 'line' as const,
      } as any);
    }

    // Add trend line
    const trendData = calculateTrendLine(actualData);
    datasets.push({
      label: 'Trend',
      data: trendData,
      backgroundColor: 'transparent',
      borderColor: DEFAULT_CHART_COLORS.secondary,
      borderWidth: 2,
      borderDash: [3, 3],
      type: 'line' as const,
      pointRadius: 0,
    } as any);

    return {
      labels,
      datasets,
    };
  }, [data, targetAmount]);

  /**
   * Chart options
   */
  const options = useMemo(() => {
    return getBarChartOptions({
      plugins: {
        title: {
          display: true,
          text: 'Monthly Reduction Progress',
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              if (label === 'Target') {
                return `${label}: ${formatCurrencyLabel(value)} (Goal)`;
              }
              return `${label}: ${formatCurrencyLabel(value)}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: any) => formatCurrencyLabel(value),
          },
          title: {
            display: true,
            text: 'Reduction Amount',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Month',
          },
        },
      },
    });
  }, []);

  /**
   * Timeline preset buttons
   */
  const timelinePresets = [
    { label: '3 Months', value: 3 },
    { label: '6 Months', value: 6 },
    { label: '12 Months', value: 12 },
  ];

  /**
   * Calculate statistics
   */
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const totalReduction = data.reduce((sum, d) => sum + d.actual, 0);
    const avgReduction = totalReduction / data.length;
    const monthsAboveTarget =
      targetAmount !== undefined
        ? data.filter((d) => d.actual >= targetAmount).length
        : 0;

    return {
      totalReduction,
      avgReduction,
      monthsAboveTarget,
      totalMonths: data.length,
    };
  }, [data, targetAmount]);

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
        message="Error loading progress"
        description={(error as Error).message || 'Failed to load progress data'}
        height={400}
      />
    );
  }

  /**
   * Handle empty state
   */
  if (!chartData) {
    return (
      <ChartEmptyState
        message="No progress data"
        description="Start tracking your payments to see monthly progress."
        height={400}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Period
          </label>
          <div className="flex flex-wrap gap-2">
            {timelinePresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setTimelineMonths(preset.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timelineMonths === preset.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
        <div className="ml-4">
          <ChartExport chartId={chartId} fileName="progress" formats={['png', 'jpeg']} />
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">Total Reduction</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrencyLabel(stats.totalReduction)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">Average Monthly</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrencyLabel(stats.avgReduction)}
            </div>
          </div>
          {targetAmount !== undefined && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Months Met Target</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.monthsAboveTarget} / {stats.totalMonths}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <div id={chartId} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div style={{ height: '400px' }}>
          <Bar data={chartData} options={options} />
        </div>
      </div>

      {/* Info */}
      <div className="text-sm text-gray-600">
        {targetAmount ? (
          <p>
            Green bars indicate months where you met or exceeded your target of{' '}
            {formatCurrencyLabel(targetAmount)}. Red bars show months below target. The
            dashed line shows your overall trend.
          </p>
        ) : (
          <p>
            This chart shows your monthly debt reduction progress. The dashed line represents
            your overall trend over time.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProgressChart;
