/**
 * Dashboard Hooks
 *
 * React Query hooks for dashboard operations
 */

import { useQuery } from '@tanstack/react-query';
import dashboardService from '@services/dashboard.service';

/**
 * Fetch dashboard overview with key metrics
 */
export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: dashboardService.getDashboardOverview,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};

/**
 * Fetch recent activity
 */
export const useRecentActivity = (limit = 10) => {
  return useQuery({
    queryKey: ['recent-activity', limit],
    queryFn: () => dashboardService.getRecentActivity(limit),
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: true,
  });
};

/**
 * Fetch progress summary for all accounts
 */
export const useProgressSummary = () => {
  return useQuery({
    queryKey: ['progress-summary'],
    queryFn: dashboardService.getProgressSummary,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};
