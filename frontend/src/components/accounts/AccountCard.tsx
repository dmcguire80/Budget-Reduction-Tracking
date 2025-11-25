/**
 * Account Card Component
 *
 * Display account info in card format with hover effects
 */

import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardFooter } from '@components/common/Card';
import AccountTypeIcon from './AccountTypeIcon';
import { formatCurrency, formatPercentage, formatAccountType } from '@utils/format';
import { ROUTES } from '@config/constants';
import type { Account } from '@/types';
import clsx from 'clsx';

export interface AccountCardProps {
  account: Account;
}

const AccountCard = ({ account }: AccountCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(ROUTES.ACCOUNT_DETAIL(account.id));
  };

  // Calculate credit utilization if applicable
  const utilization =
    account.creditLimit && account.creditLimit > 0
      ? (account.currentBalance / account.creditLimit) * 100
      : null;

  // Determine utilization color
  const getUtilizationColor = (util: number | null) => {
    if (util === null) return 'bg-gray-300';
    if (util < 50) return 'bg-success-500';
    if (util < 80) return 'bg-warning-500';
    return 'bg-danger-500';
  };

  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
      onClick={handleClick}
    >
      <CardBody>
        {/* Header: Icon + Name */}
        <div className="flex items-start space-x-3 mb-4">
          <AccountTypeIcon accountType={account.accountType} size="md" />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {account.name}
            </h3>
            <p className="text-sm text-gray-600">
              {formatAccountType(account.accountType)}
            </p>
          </div>
          {!account.isActive && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
              Inactive
            </span>
          )}
        </div>

        {/* Balance */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">Current Balance</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(account.currentBalance)}
          </p>
        </div>

        {/* Credit Limit & Utilization */}
        {account.creditLimit && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-600">Credit Limit</p>
              <p className="text-sm font-medium text-gray-900">
                {formatCurrency(account.creditLimit)}
              </p>
            </div>
            {utilization !== null && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={clsx('h-full transition-all duration-300', getUtilizationColor(utilization))}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1 text-right">
                  {formatPercentage(utilization, 1, false)} utilized
                </p>
              </>
            )}
          </div>
        )}

        {/* Minimum Payment */}
        {account.minimumPayment && (
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-600">Minimum Payment</p>
            <p className="text-sm font-medium text-gray-900">
              {formatCurrency(account.minimumPayment)}
            </p>
          </div>
        )}

        {/* Due Day */}
        {account.dueDay && (
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-600">Due Day</p>
            <p className="text-sm font-medium text-gray-900">
              Day {account.dueDay} of month
            </p>
          </div>
        )}
      </CardBody>

      <CardFooter>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-sm text-gray-600">
              {formatPercentage(account.interestRate, 2, false)} APR
            </span>
          </div>
          <button
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            View Details →
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AccountCard;
