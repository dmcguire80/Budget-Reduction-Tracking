/**
 * Chart Loading Skeleton
 *
 * Loading placeholder for charts with animated shimmer effect
 */

import React from 'react';

interface ChartLoadingSkeletonProps {
  height?: number;
  className?: string;
}

export const ChartLoadingSkeleton: React.FC<ChartLoadingSkeletonProps> = ({
  height = 400,
  className = '',
}) => {
  return (
    <div
      className={`animate-pulse bg-gray-100 rounded-lg ${className}`}
      style={{ height: `${height}px` }}
    >
      <div className="h-full flex flex-col justify-between p-6">
        {/* Legend */}
        <div className="flex justify-end space-x-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <div className="w-20 h-3 bg-gray-300 rounded"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <div className="w-20 h-3 bg-gray-300 rounded"></div>
          </div>
        </div>

        {/* Chart area */}
        <div className="flex-1 flex items-end justify-between space-x-2">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gray-300 rounded-t"
              style={{
                height: `${Math.random() * 60 + 40}%`,
              }}
            ></div>
          ))}
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between mt-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-12 h-2 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
    </div>
  );
};

/**
 * Compact chart loading skeleton for smaller charts
 */
export const CompactChartLoadingSkeleton: React.FC<ChartLoadingSkeletonProps> = ({
  height = 200,
  className = '',
}) => {
  return (
    <div
      className={`animate-pulse bg-gray-100 rounded-lg relative overflow-hidden ${className}`}
      style={{ height: `${height}px` }}
    >
      <div className="h-full flex items-center justify-center">
        <div className="w-32 h-32 border-8 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
    </div>
  );
};

export default ChartLoadingSkeleton;
