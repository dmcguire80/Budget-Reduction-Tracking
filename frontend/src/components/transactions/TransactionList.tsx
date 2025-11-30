/**
 * Transaction List Component
 *
 * Paginated transaction list with filtering and sorting
 */

import { useState } from 'react';
import { Transaction, TransactionFilters } from '@/types/transaction.types';
import { useAccountTransactions, useAllTransactions, useDeleteTransaction } from '@hooks/useTransactions';
import { PAGINATION } from '@config/constants';
import TransactionItem from './TransactionItem';
import TransactionFiltersComponent from './TransactionFilters';
import TransactionModal from './TransactionModal';
import EmptyState from '@components/common/EmptyState';
import Button from '@components/common/Button';

export interface TransactionListProps {
  accountId?: string;
  showFilters?: boolean;
  limit?: number;
}

const TransactionList = ({
  accountId,
  showFilters = true,
  limit = PAGINATION.DEFAULT_LIMIT,
}: TransactionListProps) => {
  const [filters, setFilters] = useState<TransactionFilters>({
    limit,
    offset: 0,
  });
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch transactions based on whether accountId is provided
  const accountTransactionsQuery = useAccountTransactions(
    accountId!,
    accountId ? filters : undefined
  );
  const allTransactionsQuery = useAllTransactions(!accountId ? filters : undefined);

  const query = accountId ? accountTransactionsQuery : allTransactionsQuery;
  const { data: transactions = [], isLoading, error } = query;

  const deleteMutation = useDeleteTransaction();

  const handleFiltersChange = (newFilters: TransactionFilters) => {
    setFilters({ ...newFilters, limit, offset: 0 });
  };

  const handleClearFilters = () => {
    setFilters({ limit, offset: 0 });
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (transaction: Transaction) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(transaction.id);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  const handleLoadMore = () => {
    setFilters((prev) => ({
      ...prev,
      offset: (prev.offset || 0) + limit,
    }));
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  // Loading skeleton
  if (isLoading && !transactions.length) {
    return (
      <div className="space-y-4">
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          </div>
        )}
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium">Failed to load transactions</p>
        <p className="text-red-600 text-sm mt-2">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
      </div>
    );
  }

  // Empty state
  if (!transactions.length && !isLoading) {
    const hasFilters = !!(
      filters.transactionType ||
      filters.startDate ||
      filters.endDate ||
      filters.search
    );

    return (
      <div className="space-y-4">
        {showFilters && (
          <TransactionFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        )}
        <EmptyState
          title={hasFilters ? 'No transactions found' : 'No transactions yet'}
          description={
            hasFilters
              ? 'Try adjusting your filters to see more results.'
              : 'Start tracking your transactions by adding your first one.'
          }
          actionLabel={hasFilters ? 'Clear Filters' : undefined}
          onAction={hasFilters ? handleClearFilters : undefined}
        />
      </div>
    );
  }

  // Sort transactions by date (most recent first)
  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <TransactionFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Transaction Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {sortedTransactions.length} transaction{sortedTransactions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {sortedTransactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showActions
          />
        ))}
      </div>

      {/* Load More */}
      {transactions.length >= limit && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            isLoading={isLoading}
          >
            Load More
          </Button>
        </div>
      )}

      {/* Edit Modal */}
      {editingTransaction && (
        <TransactionModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          mode="edit"
          accountId={editingTransaction.accountId}
          transaction={editingTransaction}
        />
      )}
    </div>
  );
};

export default TransactionList;
