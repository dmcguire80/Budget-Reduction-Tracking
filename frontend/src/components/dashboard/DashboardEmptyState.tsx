/**
 * DashboardEmptyState Component
 *
 * Welcome screen for new users with onboarding guidance
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody } from '@components/common/Card';
import Button from '@components/common/Button';
import { ROUTES } from '@config/constants';

interface DashboardEmptyStateProps {
  onAddAccount?: () => void;
}

const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({
  onAddAccount,
}) => {
  const navigate = useNavigate();

  const handleAddAccount = () => {
    if (onAddAccount) {
      onAddAccount();
    } else {
      navigate(ROUTES.ACCOUNTS);
    }
  };

  return (
    <div className="min-h-[600px] flex items-center justify-center">
      <Card className="max-w-2xl w-full">
        <CardBody className="text-center py-12 px-6">
          {/* Illustration */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <svg
                className="w-32 h-32 text-primary-600 dark:text-primary-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Budget Reduction Tracker!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Start your debt reduction journey by adding your first account.
          </p>

          {/* Quick Start Guide */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Start Guide
            </h2>
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 dark:bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Add Your First Account
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enter details about your credit card, loan, or other debt account
                    including current balance and interest rate.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 dark:bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Record Payments
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Track every payment you make and watch your debt decrease over time.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 dark:bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Track Your Progress
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Visualize your debt reduction journey with charts and analytics,
                    and stay motivated!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleAddAccount}
            variant="primary"
            size="lg"
            className="px-8"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 4v16m8-8H4" />
            </svg>
            Add Your First Account
          </Button>

          {/* Helpful Tips */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Helpful Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="bg-info-50 dark:bg-info-900/20 rounded-lg p-4">
                <div className="w-8 h-8 bg-info-600 text-white rounded-lg flex items-center justify-center mb-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Be Accurate
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Enter exact balances and interest rates for the most accurate tracking.
                </p>
              </div>

              <div className="bg-success-50 dark:bg-success-900/20 rounded-lg p-4">
                <div className="w-8 h-8 bg-success-600 text-white rounded-lg flex items-center justify-center mb-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Stay Consistent
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Update your transactions regularly to see accurate progress trends.
                </p>
              </div>

              <div className="bg-warning-50 dark:bg-warning-900/20 rounded-lg p-4">
                <div className="w-8 h-8 bg-warning-600 text-white rounded-lg flex items-center justify-center mb-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Celebrate Wins
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Every payment brings you closer to being debt-free. Keep going!
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DashboardEmptyState;
