/**
 * SummaryCard Component
 *
 * Card component displaying key metrics with icon, value, and trend
 */

import React from 'react';
import { Card, CardBody } from '@components/common/Card';
import type { SummaryCardProps } from '../../types/dashboard.types';

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  colorScheme = 'primary',
  isLoading = false,
}) => {
  // Color scheme mapping
  const colorClasses = {
    primary: {
      bg: 'bg-primary-100',
      text: 'text-primary-600',
      trend: 'text-primary-700',
    },
    success: {
      bg: 'bg-success-100',
      text: 'text-success-600',
      trend: 'text-success-700',
    },
    danger: {
      bg: 'bg-danger-100',
      text: 'text-danger-600',
      trend: 'text-danger-700',
    },
    warning: {
      bg: 'bg-warning-100',
      text: 'text-warning-600',
      trend: 'text-warning-700',
    },
    info: {
      bg: 'bg-info-100',
      text: 'text-info-600',
      trend: 'text-info-700',
    },
  };

  const colors = colorClasses[colorScheme];

  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
              {subtitle && <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />}
            </div>
            <div className={`w-12 h-12 ${colors.bg} rounded-lg animate-pulse`} />
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {/* Title */}
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>

            {/* Value */}
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{subtitle}</p>
            )}

            {/* Trend */}
            {trend && (
              <div className="flex items-center space-x-1">
                {trend.isPositive ? (
                  <svg
                    className="w-4 h-4 text-success-600"
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
                    className="w-4 h-4 text-danger-600"
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
                <span
                  className={`text-xs font-medium ${
                    trend.isPositive ? 'text-success-600' : 'text-danger-600'
                  }`}
                >
                  {Math.abs(trend.value).toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{trend.label}</span>
              </div>
            )}
          </div>

          {/* Icon */}
          <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0 ${colors.text}`}>
            {icon}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default SummaryCard;
