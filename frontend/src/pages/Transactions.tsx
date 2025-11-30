/**
 * Transactions Page
 *
 * View all transactions across all accounts
 */

import TransactionList from '@components/transactions/TransactionList';
import Card from '@components/common/Card';

const Transactions = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Transactions</h1>
        <p className="mt-2 text-gray-600">
          View and manage transactions across all your accounts
        </p>
      </div>

      {/* Transaction List */}
      <Card>
        <TransactionList showFilters={true} />
      </Card>
    </div>
  );
};

export default Transactions;
