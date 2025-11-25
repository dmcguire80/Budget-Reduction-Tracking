/**
 * Account Detail Page
 *
 * View account information and analytics
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '@components/common/Button';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ErrorMessage from '@components/common/ErrorMessage';
import { Card, CardHeader, CardBody } from '@components/common/Card';
import AccountTypeIcon from '@components/accounts/AccountTypeIcon';
import AccountStats from '@components/accounts/AccountStats';
import AccountModal from '@components/accounts/AccountModal';
import TransactionList from '@components/transactions/TransactionList';
import TransactionModal from '@components/transactions/TransactionModal';
import { useAccountSummary, useDeleteAccount } from '@hooks/useAccounts';
import { formatCurrency, formatPercentage, formatAccountType, formatDate } from '@utils/format';
import { ROUTES, SUCCESS_MESSAGES } from '@config/constants';

const AccountDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch account summary with analytics
  const { data: accountSummary, isLoading, error, refetch } = useAccountSummary(id!);
  const deleteAccount = useDeleteAccount();

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleEditSuccess = () => {
    refetch();
  };

  const handleDelete = async () => {
    if (!id) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this account? This action cannot be undone and will delete all associated transactions.'
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteAccount.mutateAsync(id);
      alert(SUCCESS_MESSAGES.ACCOUNT_DELETED);
      navigate(ROUTES.ACCOUNTS);
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleBack = () => {
    navigate(ROUTES.ACCOUNTS);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !accountSummary) {
    return (
      <ErrorMessage
        message="Failed to load account details. Please try again."
        onRetry={refetch}
      />
    );
  }

  const { account, analytics } = accountSummary;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
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
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Back to Accounts
      </button>

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <AccountTypeIcon accountType={account.accountType} size="lg" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{account.name}</h1>
            <p className="mt-1 text-gray-600">{formatAccountType(account.accountType)}</p>
            <div className="flex items-center space-x-3 mt-2">
              <span
                className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                  account.isActive
                    ? 'bg-success-100 text-success-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {account.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-sm text-gray-500">
                Created {formatDate(account.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleEdit}>
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </Button>
        </div>
      </div>

      {/* Account Information Card */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(account.currentBalance)}
              </p>
            </div>

            {account.creditLimit && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Credit Limit</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(account.creditLimit)}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 mb-1">Interest Rate (APR)</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(account.interestRate, 2, false)}
              </p>
            </div>

            {account.minimumPayment && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Minimum Payment</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(account.minimumPayment)}
                </p>
              </div>
            )}

            {account.dueDay && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Payment Due Day</p>
                <p className="text-2xl font-bold text-gray-900">Day {account.dueDay}</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Analytics Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Analytics</h2>
        <AccountStats
          totalReduction={analytics.totalReduction}
          progressPercentage={analytics.progressPercentage}
          averageMonthlyReduction={analytics.averageMonthlyReduction}
          totalPayments={analytics.totalPayments}
          totalCharges={analytics.totalCharges}
        />
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
            <Button
              variant="primary"
              onClick={() => setIsAddTransactionModalOpen(true)}
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
              Add Transaction
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <TransactionList accountId={id} showFilters={true} limit={10} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Balance Trend</h2>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8 text-gray-500">
            <p>Balance chart will be implemented by the Charts Agent.</p>
            <p className="text-sm mt-2">Coming soon...</p>
          </div>
        </CardBody>
      </Card>

      {/* Edit Account Modal */}
      <AccountModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        mode="edit"
        account={account}
        onSuccess={handleEditSuccess}
      />

      {/* Add Transaction Modal */}
      <TransactionModal
        isOpen={isAddTransactionModalOpen}
        onClose={() => setIsAddTransactionModalOpen(false)}
        mode="create"
        accountId={id!}
      />
    </div>
  );
};

export default AccountDetail;
