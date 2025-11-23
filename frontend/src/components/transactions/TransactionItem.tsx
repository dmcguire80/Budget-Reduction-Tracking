/**
 * Transaction Item Component
 *
 * Single transaction display for list view
 */

import clsx from 'clsx';
import { formatCurrency, formatDate } from '@utils/format';
import { Transaction, TransactionType } from '@/types/transaction.types';
import TransactionTypeIcon from './TransactionTypeIcon';

export interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  showActions?: boolean;
}

const TransactionItem = ({
  transaction,
  onEdit,
  onDelete,
  showActions = true,
}: TransactionItemProps) => {
  const getAmountColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.PAYMENT:
        return 'text-green-600';
      case TransactionType.CHARGE:
        return 'text-red-600';
      case TransactionType.ADJUSTMENT:
        return 'text-yellow-600';
      case TransactionType.INTEREST:
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getAmountPrefix = (type: TransactionType) => {
    switch (type) {
      case TransactionType.PAYMENT:
        return '-';
      case TransactionType.CHARGE:
        return '+';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 flex-1">
        {/* Type Icon */}
        <div className="flex-shrink-0">
          <TransactionTypeIcon type={transaction.transactionType} size="md" />
        </div>

        {/* Transaction Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-gray-600">
              {formatDate(transaction.transactionDate)}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <TransactionTypeIcon
              type={transaction.transactionType}
              size="sm"
              showBadge
            />
          </div>
          {transaction.description && (
            <p className="mt-1 text-sm text-gray-700 truncate">
              {transaction.description}
            </p>
          )}
        </div>

        {/* Amount */}
        <div className="flex-shrink-0 text-right">
          <p className={clsx('text-xl font-bold', getAmountColor(transaction.transactionType))}>
            {getAmountPrefix(transaction.transactionType)}
            {formatCurrency(Math.abs(transaction.amount))}
          </p>
        </div>
      </div>

      {/* Actions */}
      {showActions && (onEdit || onDelete) && (
        <div className="flex items-center gap-2 ml-4">
          {onEdit && (
            <button
              onClick={() => onEdit(transaction)}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit transaction"
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
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(transaction)}
              className="p-2 text-gray-600 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
              title="Delete transaction"
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
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionItem;
