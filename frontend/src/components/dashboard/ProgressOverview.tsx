/**
 * ProgressOverview Component
 *
 * Displays progress bars for each account and overall progress
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '@components/common/Card';
import EmptyState from '@components/common/EmptyState';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { formatCurrency, formatPercentage } from '@utils/format';
import { ROUTES } from '@config/constants';
import type { ProgressSummary } from '../../types/dashboard.types';

interface ProgressOverviewProps {
  progressSummary: ProgressSummary | null;
  isLoading?: boolean;
}

const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  progressSummary,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  // Get progress bar color based on percentage
  const getProgressColor = (progress: number): string => {
    if (progress >= 50) return 'bg-success-600';
    if (progress >= 20) return 'bg-warning-600';
    return 'bg-danger-600';
  };

  // Get progress bar background color
  const getProgressBgColor = (progress: number): string => {
    if (progress >= 50) return 'bg-success-100';
    if (progress >= 20) return 'bg-warning-100';
    return 'bg-danger-100';
  };

  // Handle account click
  const handleAccountClick = (accountId: string) => {
    navigate(ROUTES.ACCOUNT_DETAIL(accountId));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Progress Overview</h2>
          <span className="text-sm text-gray-500">
            {progressSummary?.accounts.length || 0} account
            {progressSummary?.accounts.length !== 1 ? 's' : ''}
          </span>
        </div>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : !progressSummary || progressSummary.accounts.length === 0 ? (
          <EmptyState
            title="No Accounts Yet"
            description="Add your first account to start tracking your debt reduction progress."
            icon={
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
        ) : (
          <div className="space-y-6">
            {/* Overall Progress */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">Overall Progress</h3>
                <span className="text-sm font-bold text-primary-600">
                  {formatPercentage(progressSummary.overallProgress / 100)}
                </span>
              </div>
              <div className={`w-full h-3 ${getProgressBgColor(progressSummary.overallProgress)} rounded-full overflow-hidden`}>
                <div
                  className={`h-full ${getProgressColor(progressSummary.overallProgress)} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(100, progressSummary.overallProgress)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {formatCurrency(progressSummary.totalCurrentDebt)} current
                </span>
                <span className="text-xs text-gray-500">
                  of {formatCurrency(progressSummary.totalInitialDebt)} initial
                </span>
              </div>
            </div>

            {/* Individual Account Progress */}
            <div className="space-y-4">
              {progressSummary.accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleAccountClick(account.id)}
                  className="w-full text-left group hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                        {account.name}
                      </h4>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 ml-2">
                      {formatPercentage(account.progress / 100)}
                    </span>
                  </div>
                  <div className={`w-full h-2 ${getProgressBgColor(account.progress)} rounded-full overflow-hidden`}>
                    <div
                      className={`h-full ${getProgressColor(account.progress)} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(100, account.progress)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {formatCurrency(account.currentBalance)}
                    </span>
                    <span className="text-xs text-gray-500">
                      / {formatCurrency(account.initialBalance)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ProgressOverview;
