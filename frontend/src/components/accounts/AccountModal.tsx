/**
 * Account Modal Component
 *
 * Modal for creating/editing accounts
 */

import Modal from '@components/common/Modal';
import AccountForm from './AccountForm';
import { useCreateAccount, useUpdateAccount } from '@hooks/useAccounts';
import { AccountFormValues } from '@validators/account.schemas';
import type { Account } from '@types/account.types';
import { SUCCESS_MESSAGES } from '@config/constants';

export interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  account?: Account;
  onSuccess?: () => void;
}

const AccountModal = ({ isOpen, onClose, mode, account, onSuccess }: AccountModalProps) => {
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();

  const handleSubmit = async (data: AccountFormValues) => {
    try {
      if (mode === 'create') {
        await createAccount.mutateAsync(data);
        alert(SUCCESS_MESSAGES.ACCOUNT_CREATED);
      } else if (mode === 'edit' && account) {
        await updateAccount.mutateAsync({ id: account.id, data });
        alert(SUCCESS_MESSAGES.ACCOUNT_UPDATED);
      }

      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error saving account:', error);
      // Error will be shown via error state in the mutation
      alert(
        `Failed to ${mode === 'create' ? 'create' : 'update'} account. Please try again.`
      );
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const isSubmitting = createAccount.isPending || updateAccount.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create New Account' : 'Edit Account'}
      size="lg"
      closeOnBackdropClick={!isSubmitting}
    >
      <AccountForm
        account={mode === 'edit' ? account : undefined}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
};

export default AccountModal;
