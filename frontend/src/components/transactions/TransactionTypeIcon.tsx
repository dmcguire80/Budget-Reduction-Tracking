/**
 * Transaction Type Icon Component
 *
 * Visual icons for each transaction type with color coding
 */

import clsx from 'clsx';
import { TransactionType } from '@/types/transaction.types';

export interface TransactionTypeIconProps {
  type: TransactionType;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

const TransactionTypeIcon = ({
  type,
  size = 'md',
  showBadge = false,
}: TransactionTypeIconProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const badgeSizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const getIconConfig = () => {
    switch (type) {
      case TransactionType.PAYMENT:
        return {
          icon: (
            <svg
              className={sizeClasses[size]}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          ),
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-600',
          label: 'Payment',
        };

      case TransactionType.CHARGE:
        return {
          icon: (
            <svg
              className={sizeClasses[size]}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
            </svg>
          ),
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-600',
          label: 'Charge',
        };

      case TransactionType.ADJUSTMENT:
        return {
          icon: (
            <svg
              className={sizeClasses[size]}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          ),
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-600',
          label: 'Adjustment',
        };

      case TransactionType.INTEREST:
        return {
          icon: (
            <svg
              className={sizeClasses[size]}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          ),
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          borderColor: 'border-orange-600',
          label: 'Interest',
        };

      default:
        return {
          icon: (
            <svg
              className={sizeClasses[size]}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          ),
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-600',
          label: 'Unknown',
        };
    }
  };

  const config = getIconConfig();

  if (showBadge) {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 font-medium rounded-full border',
          config.color,
          config.bgColor,
          config.borderColor,
          badgeSizeClasses[size]
        )}
      >
        {config.icon}
        <span>{config.label}</span>
      </span>
    );
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-full',
        config.color,
        config.bgColor,
        'p-2'
      )}
      title={config.label}
    >
      {config.icon}
    </span>
  );
};

export default TransactionTypeIcon;
