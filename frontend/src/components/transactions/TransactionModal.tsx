/**
 * Transaction Modal Component
 *
 * Modal for adding or editing transactions
 */

import { useState } from 'react';
import { format } from 'date-fns';
import Modal from '@components/common/Modal';
import TransactionForm from './TransactionForm';
import { useCreateTransaction, useUpdateTransaction } from '@hooks/useTransactions';
import { Transaction } from '@/types/transaction.types';
import { TransactionFormValues } from '@validators/transaction.schemas';
import { SUCCESS_MESSAGES, DATE_FORMATS } from '@config/constants';

export interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  accountId: string;
  transaction?: Transaction;
}

const TransactionModal = ({
  isOpen,
  onClose,
  mode,
  accountId,
  transaction,
}: TransactionModalProps) => {
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (data: TransactionFormValues) => {
    setError(null);

    try {
      // Convert date to ISO string if it's a Date object
      const formattedData = {
        ...data,
        transactionDate:
          typeof data.transactionDate === 'string'
            ? data.transactionDate
            : format(data.transactionDate, DATE_FORMATS.INPUT),
      };

      if (mode === 'create') {
        await createMutation.mutateAsync({
          accountId,
          data: formattedData,
        });
        alert(SUCCESS_MESSAGES.TRANSACTION_CREATED);
      } else if (transaction) {
        await updateMutation.mutateAsync({
          id: transaction.id,
          data: formattedData,
        });
        alert(SUCCESS_MESSAGES.TRANSACTION_UPDATED);
      }

      onClose();
    } catch (err) {
      console.error('Transaction submission error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save transaction. Please try again.'
      );
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'create' ? 'Add Transaction' : 'Edit Transaction'}
      size="md"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <TransactionForm
        transaction={transaction}
        onSubmit={handleSubmit}
        onCancel={handleClose}
        isLoading={isLoading}
      />
    </Modal>
  );
};

export default TransactionModal;
