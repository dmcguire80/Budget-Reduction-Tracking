/**
 * StatComparison Component
 *
 * Compares current and previous statistics with visual indicators
 */

import React from 'react';
import { formatCurrency } from '@utils/format';
import type { StatComparison as StatComparisonType } from '../../types/dashboard.types';

interface StatComparisonProps {
  stat: StatComparisonType;
  showCurrency?: boolean;
}

const StatComparison: React.FC<StatComparisonProps> = ({
  stat,
  showCurrency = true,
}) => {
  const { label, currentValue, changePercentage, isPositive } = stat;

  // Format value based on type
  const formattedValue = showCurrency
    ? formatCurrency(currentValue)
    : currentValue.toLocaleString();

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      {/* Label */}
      <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>

      {/* Current Value */}
      <p className="text-3xl font-bold text-gray-900 mb-2">
        {formattedValue}
      </p>

      {/* Comparison */}
      <div className="flex items-center space-x-2">
        {/* Arrow Icon */}
        <div
          className={`flex-shrink-0 ${
            isPositive ? 'text-success-600' : 'text-danger-600'
          }`}
        >
          {isPositive ? (
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          )}
        </div>

        {/* Percentage Change */}
        <span
          className={`text-sm font-semibold ${
            isPositive ? 'text-success-600' : 'text-danger-600'
          }`}
        >
          {Math.abs(changePercentage).toFixed(1)}%
        </span>

        {/* Description */}
        <span className="text-sm text-gray-500">from last month</span>
      </div>
    </div>
  );
};

export default StatComparison;
