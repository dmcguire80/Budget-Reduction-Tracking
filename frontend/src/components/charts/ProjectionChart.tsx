/**
 * Projection Chart
 *
 * Line chart showing debt payoff timeline with multiple payment scenarios
 */

import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { ProjectionChartProps } from '../../types/chart.types';
import { useProjectionData } from '../../hooks/useChartData';
import { getLineChartOptions, CHART_COLOR_ARRAY } from '../../config/chartDefaults';
import { formatCurrencyLabel, getProjectedLineStyle } from '../../utils/chart.utils';
import ChartLoadingSkeleton from './ChartLoadingSkeleton';
import ChartEmptyState from './ChartEmptyState';
import ChartExport from './ChartExport';

export const ProjectionChart: React.FC<ProjectionChartProps> = ({
  accountId,
  scenarios,
}) => {
  const chartId = 'projection-chart';

  // Fetch projection data
  const { data, isLoading, error } = useProjectionData(accountId, scenarios);

  /**
   * Transform data for chart
   */
  const chartData = useMemo(() => {
    if (!data || !data.scenarios || data.scenarios.length === 0) {
      return null;
    }

    // Find the maximum number of months across all scenarios
    const maxMonths = Math.max(...data.scenarios.map((s) => s.data.length));

    const labels = Array.from({ length: maxMonths }, (_, i) => `Month ${i}`);

    const datasets = data.scenarios.map((scenario, index) => {
      const actualData: (number | null)[] = [];
      const projectedData: (number | null)[] = [];

      // Separate actual and projected data
      scenario.data.forEach((point, idx) => {
        if (point.isProjected) {
          actualData.push(null);
          projectedData.push(point.balance);
        } else {
          actualData.push(point.balance);
          projectedData.push(null);
        }
      });

      // Fill remaining with nulls
      while (actualData.length < maxMonths) {
        actualData.push(null);
        projectedData.push(null);
      }

      const color = CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length];

      return [
        {
          label: `${scenario.label} (Actual)`,
          data: actualData,
          borderColor: color,
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          label: `${scenario.label} (Projected)`,
          data: projectedData,
          borderColor: color,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: getProjectedLineStyle(),
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointStyle: 'circle',
        },
      ];
    }).flat();

    return {
      labels,
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
          text: 'Debt Payoff Projection',
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          callbacks: {
            label: (context: any) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              if (value === null) return '';
              return `${label}: ${formatCurrencyLabel(value)}`;
            },
            footer: (tooltipItems: any) => {
              const monthIndex = tooltipItems[0].dataIndex;
              return `Timeline: ${monthIndex} months`;
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
            text: 'Balance',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Timeline',
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
   * Handle loading state
   */
  if (isLoading) {
    return <ChartLoadingSkeleton height={500} />;
  }

  /**
   * Handle error state
   */
  if (error) {
    return (
      <ChartEmptyState
        message="Error loading projection"
        description={(error as Error).message || 'Failed to load projection data'}
        height={500}
      />
    );
  }

  /**
   * Handle empty state
   */
  if (!chartData || !data) {
    return (
      <ChartEmptyState
        message="No projection available"
        description="Unable to generate debt payoff projection."
        height={500}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex justify-end">
        <ChartExport chartId={chartId} fileName="projection" formats={['png', 'jpeg']} />
      </div>

      {/* Scenario Summary */}
      {data.scenarios && data.scenarios.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.scenarios.map((scenario, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-sm border-l-4"
              style={{
                borderColor: CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length],
              }}
            >
              <div className="font-semibold text-gray-900 mb-2">{scenario.label}</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Payment:</span>
                  <span className="font-medium">
                    {formatCurrencyLabel(scenario.monthlyPayment)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payoff Time:</span>
                  <span className="font-medium">{scenario.payoffMonths} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest:</span>
                  <span className="font-medium text-red-600">
                    {formatCurrencyLabel(scenario.totalInterest)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div id={chartId} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div style={{ height: '500px' }}>
          <Line data={chartData} options={options} />
        </div>
      </div>

      {/* Legend */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Understanding This Chart</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>
            <strong>Solid lines</strong> represent actual payment history.
          </p>
          <p>
            <strong>Dashed lines</strong> represent projected future balance based on the payment
            scenario.
          </p>
          <p>
            Compare different scenarios to see how increasing your monthly payment can
            significantly reduce the time and total interest paid.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectionChart;
