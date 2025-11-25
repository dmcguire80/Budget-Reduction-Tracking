/**
 * Chart Empty State
 *
 * Display component for when no chart data is available
 */

import React from 'react';
import Button from '../common/Button';

interface ChartEmptyStateProps {
  message?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  height?: number;
  className?: string;
}

export const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({
  message = 'No data to display',
  description = 'Start by adding some transactions to see your progress.',
  actionLabel,
  onAction,
  height = 400,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}
      style={{ height: `${height}px` }}
    >
      <div className="text-center max-w-md px-6">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-gray-200">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>

        {/* Message */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{message}</h3>
        {description && (
          <p className="text-sm text-gray-500 mb-6">{description}</p>
        )}

        {/* Action button */}
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="primary">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Compact empty state for smaller charts
 */
export const CompactChartEmptyState: React.FC<ChartEmptyStateProps> = ({
  message = 'No data',
  height = 200,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 ${className}`}
      style={{ height: `${height}px` }}
    >
      <div className="text-center px-4">
        <svg
          className="w-12 h-12 mx-auto mb-2 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
};

export default ChartEmptyState;
