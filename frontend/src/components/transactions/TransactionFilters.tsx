/**
 * Transaction Filters Component
 *
 * Filter controls for transaction list
 */

import { useState } from 'react';
import { format, subDays, subMonths, startOfYear } from 'date-fns';
import clsx from 'clsx';
import { TransactionFilters as ITransactionFilters, TransactionType } from '@/types/transaction.types';
import { TRANSACTION_TYPES, DATE_FORMATS } from '@config/constants';
import Button from '@components/common/Button';

export interface TransactionFiltersProps {
  filters: ITransactionFilters;
  onFiltersChange: (filters: ITransactionFilters) => void;
  onClearFilters: () => void;
}

type QuickFilterOption = {
  label: string;
  getValue: () => { startDate: string; endDate: string };
};

const TransactionFiltersComponent = ({
  filters,
  onFiltersChange,
  onClearFilters,
}: TransactionFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const quickFilters: QuickFilterOption[] = [
    {
      label: 'Last 30 days',
      getValue: () => ({
        startDate: format(subDays(new Date(), 30), DATE_FORMATS.INPUT),
        endDate: format(new Date(), DATE_FORMATS.INPUT),
      }),
    },
    {
      label: 'Last 3 months',
      getValue: () => ({
        startDate: format(subMonths(new Date(), 3), DATE_FORMATS.INPUT),
        endDate: format(new Date(), DATE_FORMATS.INPUT),
      }),
    },
    {
      label: 'This year',
      getValue: () => ({
        startDate: format(startOfYear(new Date()), DATE_FORMATS.INPUT),
        endDate: format(new Date(), DATE_FORMATS.INPUT),
      }),
    },
  ];

  const handleTypeChange = (type: TransactionType) => {
    onFiltersChange({
      ...filters,
      transactionType: filters.transactionType === type ? undefined : type,
    });
  };

  const handleDateRangeChange = (startDate?: string, endDate?: string) => {
    onFiltersChange({
      ...filters,
      startDate,
      endDate,
    });
  };

  const handleQuickFilter = (option: QuickFilterOption) => {
    const { startDate, endDate } = option.getValue();
    handleDateRangeChange(startDate, endDate);
  };

  const handleSearchChange = (search: string) => {
    onFiltersChange({
      ...filters,
      search: search || undefined,
    });
  };

  const hasActiveFilters = !!(
    filters.transactionType ||
    filters.startDate ||
    filters.endDate ||
    filters.search
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear all
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg
              className={clsx('w-5 h-5 transition-transform', isExpanded && 'rotate-180')}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search transactions..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {isExpanded && (
        <>
          {/* Transaction Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <div className="flex flex-wrap gap-2">
              {TRANSACTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTypeChange(type.value as TransactionType)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    filters.transactionType === type.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Date Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Date Range
            </label>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleQuickFilter(option)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
                >
                  {option.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleDateRangeChange(undefined, undefined)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
              >
                All time
              </button>
            </div>
          </div>

          {/* Custom Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Date Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="startDate" className="block text-xs text-gray-600 mb-1">
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) =>
                    handleDateRangeChange(e.target.value || undefined, filters.endDate)
                  }
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-xs text-gray-600 mb-1">
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) =>
                    handleDateRangeChange(filters.startDate, e.target.value || undefined)
                  }
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.transactionType && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs font-medium">
                Type: {filters.transactionType}
                <button
                  type="button"
                  onClick={() => handleTypeChange(filters.transactionType!)}
                  className="hover:text-primary-900"
                >
                  ×
                </button>
              </span>
            )}
            {(filters.startDate || filters.endDate) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs font-medium">
                Date Range
                <button
                  type="button"
                  onClick={() => handleDateRangeChange(undefined, undefined)}
                  className="hover:text-primary-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs font-medium">
                Search: {filters.search}
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="hover:text-primary-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFiltersComponent;
