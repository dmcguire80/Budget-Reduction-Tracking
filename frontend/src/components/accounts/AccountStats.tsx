/**
 * Account Stats Component
 *
 * Display analytics in card grid
 */

import { Card, CardBody } from '@components/common/Card';
import { formatCurrency, formatPercentage } from '@utils/format';

export interface AccountStatsProps {
  totalReduction: number;
  progressPercentage: number;
  averageMonthlyReduction: number;
  totalPayments: number;
  totalCharges: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant?: 'default' | 'success' | 'danger' | 'warning';
}

const StatCard = ({ icon, label, value, variant = 'default' }: StatCardProps) => {
  const variantStyles = {
    default: 'text-gray-600',
    success: 'text-success-600',
    danger: 'text-danger-600',
    warning: 'text-warning-600',
  };

  return (
    <Card>
      <CardBody>
        <div className="flex items-center space-x-4">
          <div className={`text-3xl ${variantStyles[variant]}`}>{icon}</div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const AccountStats = ({
  totalReduction,
  progressPercentage,
  averageMonthlyReduction,
  totalPayments,
  totalCharges,
}: AccountStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        icon={
          <svg
            className="w-8 h-8"
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
        label="Total Reduction"
        value={formatCurrency(totalReduction)}
        variant={totalReduction > 0 ? 'success' : 'default'}
      />

      <StatCard
        icon={
          <svg
            className="w-8 h-8"
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
        label="Progress"
        value={formatPercentage(progressPercentage, 1, false)}
        variant={progressPercentage >= 50 ? 'success' : progressPercentage >= 25 ? 'warning' : 'default'}
      />

      <StatCard
        icon={
          <svg
            className="w-8 h-8"
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
        label="Avg Monthly Reduction"
        value={formatCurrency(averageMonthlyReduction)}
        variant="default"
      />

      <StatCard
        icon={
          <svg
            className="w-8 h-8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
        label="Total Payments"
        value={formatCurrency(totalPayments)}
        variant="success"
      />

      <StatCard
        icon={
          <svg
            className="w-8 h-8"
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
        label="Total Charges"
        value={formatCurrency(totalCharges)}
        variant="danger"
      />

      <StatCard
        icon={
          <svg
            className="w-8 h-8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        }
        label="Net Change"
        value={formatCurrency(totalPayments - totalCharges)}
        variant={totalPayments - totalCharges > 0 ? 'success' : 'danger'}
      />
    </div>
  );
};

export default AccountStats;
