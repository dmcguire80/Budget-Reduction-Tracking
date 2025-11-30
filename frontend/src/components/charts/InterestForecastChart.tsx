/**
 * Interest Forecast Chart
 *
 * Area chart showing projected interest accumulation with multiple scenarios
 */

import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { InterestForecastChartProps } from '../../types/chart.types';
import { useInterestForecastData } from '../../hooks/useChartData';
import { getLineChartOptions, CHART_COLOR_ARRAY } from '../../config/chartDefaults';
import { formatCurrencyLabel } from '../../utils/chart.utils';
import ChartLoadingSkeleton from './ChartLoadingSkeleton';
import ChartEmptyState from './ChartEmptyState';
import ChartExport from './ChartExport';

export const InterestForecastChart: React.FC<InterestForecastChartProps> = ({
  accountId,
  months = 12,
}) => {
  const [timelineMonths, setTimelineMonths] = useState(months);
  const chartId = 'interest-forecast-chart';

  // Fetch forecast data
  const { data, isLoading, error } = useInterestForecastData(accountId, timelineMonths);

  /**
   * Transform data for chart
   */
  const chartData = useMemo(() => {
    if (!data || !data.scenarios) {
      return null;
    }

    const datasets = data.scenarios.map((scenario, index) => ({
      label: scenario.label,
      data: scenario.cumulativeInterest,
      borderColor: CHART_COLOR_ARRAY[index],
      backgroundColor: CHART_COLOR_ARRAY[index] + '40',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5,
    }));

    return {
      labels: data.labels,
      datasets,
    };
  }, [data]);

  /**
   * Chart options
   */
  const options = useMemo(() => {
    return getLineChartOptions({
      plugins: {
        title: {
          display: true,
          text: 'Interest Accumulation Forecast',
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
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
          beginAtZero: true,
          ticks: {
            callback: (value: any) => formatCurrencyLabel(value),
          },
          title: {
            display: true,
            text: 'Cumulative Interest',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Month',
          },
        },
      },
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
    });
  }, []);

  /**
   * Timeline preset buttons
   */
  const timelinePresets = [
    { label: '3 Months', value: 3 },
    { label: '6 Months', value: 6 },
    { label: '1 Year', value: 12 },
    { label: '2 Years', value: 24 },
    { label: '5 Years', value: 60 },
  ];

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
        message="Error loading forecast"
        description={(error as Error).message || 'Failed to load interest forecast data'}
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
        message="No forecast available"
        description="Unable to generate interest forecast for this account."
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
            Forecast Timeline
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
          <ChartExport chartId={chartId} fileName="interest-forecast" formats={['png', 'jpeg']} />
        </div>
      </div>

      {/* Chart */}
      <div id={chartId} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div style={{ height: '400px' }}>
          <Line data={chartData} options={options} />
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">About This Forecast</h4>
        <p className="text-sm text-blue-800">
          This chart projects how much interest will accumulate under different payment scenarios.
          The lower the line, the less interest you'll pay overall. Making extra payments can
          significantly reduce your total interest cost.
        </p>
      </div>
    </div>
  );
};

export default InterestForecastChart;
