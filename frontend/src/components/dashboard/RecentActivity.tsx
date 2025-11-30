/**
 * RecentActivity Component
 *
 * Displays a list of recent transactions and activities
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '@components/common/Card';
import EmptyState from '@components/common/EmptyState';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { formatCurrency, formatRelativeTime } from '@utils/format';
import { ROUTES } from '@config/constants';
import type { Activity } from '../../types/dashboard.types';

interface RecentActivityProps {
  activities: Activity[];
  isLoading?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  isLoading = false,
}) => {
  // Get icon based on activity type
  const getActivityIcon = (activity: Activity) => {
    if (activity.type === 'transaction') {
      // Parse transaction type from description if available
      const isPayment = activity.description?.includes('PAYMENT');
      const isCharge = activity.description?.includes('CHARGE');

      if (isPayment) {
        return (
          <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-success-600"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        );
      } else if (isCharge) {
        return (
          <div className="w-10 h-10 bg-danger-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-danger-600"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        );
      }
    }

    // Default icon
    return (
      <div className="w-10 h-10 bg-info-100 rounded-full flex items-center justify-center">
        <svg
          className="w-5 h-5 text-info-600"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    );
  };

  // Get color for amount
  const getAmountColor = (activity: Activity) => {
    const isPayment = activity.description?.includes('PAYMENT');
    return isPayment ? 'text-success-600' : 'text-gray-900 dark:text-white';
  };

  // Group activities by date
  const groupedActivities = React.useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groups: {
      today: Activity[];
      yesterday: Activity[];
      thisWeek: Activity[];
      older: Activity[];
    } = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    activities.forEach((activity) => {
      const activityDate = new Date(activity.date);
      if (activityDate >= today) {
        groups.today.push(activity);
      } else if (activityDate >= yesterday) {
        groups.yesterday.push(activity);
      } else if (activityDate >= weekAgo) {
        groups.thisWeek.push(activity);
      } else {
        groups.older.push(activity);
      }
    });

    return groups;
  }, [activities]);

  // Render activity group
  const renderActivityGroup = (title: string, items: Activity[]) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-4 last:mb-0">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          {title}
        </h4>
        <div className="space-y-3">
          {items.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              {getActivityIcon(activity)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {activity.accountName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {formatRelativeTime(activity.date)}
                </p>
              </div>
              {activity.amount !== undefined && (
                <div className="flex-shrink-0">
                  <p className={`text-sm font-semibold ${getAmountColor(activity)}`}>
                    {formatCurrency(activity.amount)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          <Link
            to={ROUTES.TRANSACTIONS}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
          >
            View All
          </Link>
        </div>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : activities.length === 0 ? (
          <EmptyState
            title="No Recent Activity"
            description="Your recent transactions and activities will appear here."
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
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
        ) : (
          <div className="space-y-4">
            {renderActivityGroup('Today', groupedActivities.today)}
            {renderActivityGroup('Yesterday', groupedActivities.yesterday)}
            {renderActivityGroup('This Week', groupedActivities.thisWeek)}
            {renderActivityGroup('Older', groupedActivities.older)}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RecentActivity;
