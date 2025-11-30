/**
 * Dashboard Page
 *
 * Main dashboard with comprehensive overview, analytics, and quick actions
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '@components/common/Card';
import Button from '@components/common/Button';
import SummaryCard from '@components/dashboard/SummaryCard';
import RecentActivity from '@components/dashboard/RecentActivity';
import QuickActions from '@components/dashboard/QuickActions';
import ProgressOverview from '@components/dashboard/ProgressOverview';
import DashboardEmptyState from '@components/dashboard/DashboardEmptyState';
import { useDashboardOverview, useRecentActivity, useProgressSummary } from '@hooks/useDashboard';
import { useAccounts } from '@hooks/useAccounts';
import { formatCurrency, formatDate, pluralize } from '@utils/format';
import { ROUTES } from '@config/constants';

const Dashboard = () => {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch data
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useDashboardOverview();
  const { data: activities, isLoading: activitiesLoading, refetch: refetchActivities } = useRecentActivity(10);
  const { data: progressSummary, isLoading: progressLoading, refetch: refetchProgress } = useProgressSummary();

  // Check if user has any accounts
  const hasAccounts = accounts && accounts.length > 0;

  // Handle refresh
  const handleRefresh = async () => {
    await Promise.all([
      refetchOverview(),
      refetchActivities(),
      refetchProgress(),
    ]);
    setRefreshKey((prev) => prev + 1);
  };

  // Quick actions
  const quickActions = [
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      label: 'Record Payment',
      description: 'Add a new payment',
      onClick: () => navigate(ROUTES.TRANSACTIONS),
      color: 'bg-success-100 text-success-600',
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M12 4v16m8-8H4" />
        </svg>
      ),
      label: 'Add Account',
      description: 'Create new account',
      onClick: () => navigate(ROUTES.ACCOUNTS),
      color: 'bg-primary-100 text-primary-600',
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      label: 'Update Balance',
      description: 'Refresh balances',
      onClick: () => navigate(ROUTES.ACCOUNTS),
      color: 'bg-info-100 text-info-600',
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      label: 'View Reports',
      description: 'See analytics',
      onClick: () => navigate(ROUTES.ANALYTICS),
      color: 'bg-warning-100 text-warning-600',
    },
  ];

  // Show empty state for new users
  if (!accountsLoading && !hasAccounts) {
    return (
      <div className="space-y-6">
        <DashboardEmptyState onAddAccount={() => navigate(ROUTES.ACCOUNTS)} />
      </div>
    );
  }

  return (
    <div className="space-y-6" key={refreshKey}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back! Here's an overview of your debt reduction progress.
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="md"
          className="flex items-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Debt Card */}
        <SummaryCard
          title="Total Debt"
          value={overview ? formatCurrency(overview.totalDebt) : '$0.00'}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
          trend={
            overview?.trends
              ? {
                  value: Math.abs(overview.trends.debtChange),
                  isPositive: overview.trends.debtChange < 0, // Debt decrease is positive
                  label: overview.trends.period,
                }
              : undefined
          }
          subtitle={`Across ${accounts?.length || 0} ${pluralize(accounts?.length || 0, 'account')}`}
          colorScheme="danger"
          isLoading={overviewLoading}
        />

        {/* Total Reduction Card */}
        <SummaryCard
          title="Total Reduction"
          value={overview ? formatCurrency(overview.totalReduction) : '$0.00'}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          trend={
            overview?.trends
              ? {
                  value: Math.abs(overview.trends.reductionChange),
                  isPositive: overview.trends.reductionChange > 0, // Increase in reduction is positive
                  label: overview.trends.period,
                }
              : undefined
          }
          subtitle={
            overview
              ? `${overview.reductionPercentage.toFixed(1)}% progress`
              : '0% progress'
          }
          colorScheme="success"
          isLoading={overviewLoading}
        />

        {/* Interest Saved Card */}
        <SummaryCard
          title="Interest Saved"
          value={overview ? formatCurrency(overview.interestSaved) : '$0.00'}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          subtitle="Compared to min payments"
          colorScheme="info"
          isLoading={overviewLoading}
        />

        {/* Projected Debt-Free Date Card */}
        <SummaryCard
          title="Debt-Free Target"
          value={
            overview?.projectedDebtFreeDate
              ? formatDate(overview.projectedDebtFreeDate)
              : 'Not yet available'
          }
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          subtitle="Based on current trend"
          colorScheme="primary"
          isLoading={overviewLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart and Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Chart Placeholder */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">
                Balance Reduction Progress
              </h2>
            </CardHeader>
            <CardBody>
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-600">
                    Balance reduction chart will be available once you have transaction history.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    This chart will be implemented by Agent 10 (Chart Components)
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <QuickActions actions={quickActions} />
        </div>

        {/* Right Column - Recent Activity and Progress */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <RecentActivity
            activities={activities || []}
            isLoading={activitiesLoading}
          />

          {/* Progress Overview */}
          <ProgressOverview
            progressSummary={progressSummary || null}
            isLoading={progressLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
