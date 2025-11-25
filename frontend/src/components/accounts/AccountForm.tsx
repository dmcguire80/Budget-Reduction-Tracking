/**
 * Account Form Component
 *
 * Form for creating/editing accounts with validation
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import { accountSchema, AccountFormValues } from '@validators/account.schemas';
import { AccountType } from '@/types';
import { ACCOUNT_TYPES } from '@config/constants';
import type { Account } from '@/types/account.types';

export interface AccountFormProps {
  account?: Account;
  onSubmit: (data: AccountFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const AccountForm = ({ account, onSubmit, onCancel, isSubmitting = false }: AccountFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: account
      ? {
          name: account.name,
          accountType: account.accountType,
          currentBalance: account.currentBalance,
          creditLimit: account.creditLimit || null,
          interestRate: account.interestRate,
          minimumPayment: account.minimumPayment || null,
          dueDay: account.dueDay || null,
        }
      : {
          name: '',
          accountType: AccountType.CREDIT_CARD,
          currentBalance: 0,
          creditLimit: null,
          interestRate: 0,
          minimumPayment: null,
          dueDay: null,
        },
  });

  const selectedAccountType = watch('accountType');

  // Reset form when account changes
  useEffect(() => {
    if (account) {
      reset({
        name: account.name,
        accountType: account.accountType,
        currentBalance: account.currentBalance,
        creditLimit: account.creditLimit || null,
        interestRate: account.interestRate,
        minimumPayment: account.minimumPayment || null,
        dueDay: account.dueDay || null,
      });
    }
  }, [account, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Account Name */}
      <Input
        label="Account Name"
        {...register('name')}
        error={errors.name?.message}
        placeholder="e.g., Chase Sapphire Card"
        required
      />

      {/* Account Type */}
      <div className="flex flex-col gap-1">
        <label htmlFor="accountType" className="text-sm font-medium text-gray-700">
          Account Type <span className="text-danger-500 ml-1">*</span>
        </label>
        <select
          id="accountType"
          {...register('accountType')}
          className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {ACCOUNT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.accountType && (
          <p className="text-sm text-danger-600">{errors.accountType.message}</p>
        )}
      </div>

      {/* Current Balance */}
      <Input
        label="Current Balance"
        type="number"
        step="0.01"
        {...register('currentBalance', { valueAsNumber: true })}
        error={errors.currentBalance?.message}
        placeholder="0.00"
        required
      />

      {/* Credit Limit (optional for credit cards) */}
      {selectedAccountType === AccountType.CREDIT_CARD && (
        <Input
          label="Credit Limit"
          type="number"
          step="0.01"
          {...register('creditLimit', {
            setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
          })}
          error={errors.creditLimit?.message}
          placeholder="0.00"
          helperText="Leave empty if not applicable"
        />
      )}

      {/* Interest Rate */}
      <Input
        label="Interest Rate (APR %)"
        type="number"
        step="0.01"
        {...register('interestRate', { valueAsNumber: true })}
        error={errors.interestRate?.message}
        placeholder="0.00"
        helperText="Annual Percentage Rate (0-100)"
        required
      />

      {/* Minimum Payment (optional) */}
      <Input
        label="Minimum Payment"
        type="number"
        step="0.01"
        {...register('minimumPayment', {
          setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
        })}
        error={errors.minimumPayment?.message}
        placeholder="0.00"
        helperText="Leave empty if not applicable"
      />

      {/* Due Day (optional) */}
      <Input
        label="Due Day of Month"
        type="number"
        {...register('dueDay', {
          setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
        })}
        error={errors.dueDay?.message}
        placeholder="1-31"
        helperText="Day of the month when payment is due (1-31)"
      />

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {account ? 'Update Account' : 'Create Account'}
        </Button>
      </div>
    </form>
  );
};

export default AccountForm;
