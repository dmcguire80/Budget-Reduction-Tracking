/**
 * Accounts Page
 *
 * List of all user accounts (placeholder)
 */

import Button from '@components/common/Button';
import EmptyState from '@components/common/EmptyState';

const Accounts = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="mt-2 text-gray-600">
            Manage your debt and credit accounts
          </p>
        </div>
        <Button variant="primary">
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
          Add Account
        </Button>
      </div>

      {/* Empty State */}
      <EmptyState
        icon={
          <svg
            className="w-16 h-16 text-gray-400"
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
        title="No Accounts Yet"
        description="Get started by adding your first debt or credit account to track your reduction progress."
        actionLabel="Add Your First Account"
        onAction={() => alert('Account form will be implemented by Agent 8')}
      />

      {/* Info Card */}
      <div className="rounded-md bg-primary-50 p-6 border border-primary-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-primary-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-primary-800">
              Coming Soon
            </h3>
            <div className="mt-2 text-sm text-primary-700">
              <p>Account management features will include:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Create, edit, and delete accounts</li>
                <li>Track multiple account types (credit cards, loans, mortgages, etc.)</li>
                <li>View account details including balance, interest rate, and credit limit</li>
                <li>Filter and search accounts</li>
                <li>Quick account summary cards</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accounts;
