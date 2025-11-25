/**
 * Transaction Form Component
 *
 * Form for creating and editing transactions with validation
 */

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import clsx from 'clsx';
import { transactionSchema, TransactionFormValues } from '@validators/transaction.schemas';
import { Transaction, TransactionType } from '@/types/transaction.types';
import { TRANSACTION_TYPES, DATE_FORMATS } from '@config/constants';
import Button from '@components/common/Button';
import TransactionTypeIcon from './TransactionTypeIcon';

export interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (data: TransactionFormValues) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const TransactionForm = ({
  transaction,
  onSubmit,
  onCancel,
  isLoading = false,
}: TransactionFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: transaction?.amount || 0,
      transactionType: transaction?.transactionType || TransactionType.PAYMENT,
      transactionDate: transaction?.transactionDate
        ? format(new Date(transaction.transactionDate), DATE_FORMATS.INPUT)
        : format(new Date(), DATE_FORMATS.INPUT),
      description: transaction?.description || '',
    },
  });

  const selectedType = watch('transactionType');

  useEffect(() => {
    if (transaction) {
      reset({
        amount: transaction.amount,
        transactionType: transaction.transactionType,
        transactionDate: format(new Date(transaction.transactionDate), DATE_FORMATS.INPUT),
        description: transaction.description || '',
      });
    }
  }, [transaction, reset]);

  const getAmountColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.PAYMENT:
        return 'border-green-500 focus:ring-green-500';
      case TransactionType.CHARGE:
        return 'border-red-500 focus:ring-red-500';
      case TransactionType.ADJUSTMENT:
        return 'border-yellow-500 focus:ring-yellow-500';
      case TransactionType.INTEREST:
        return 'border-orange-500 focus:ring-orange-500';
      default:
        return 'border-gray-300 focus:ring-primary-500';
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Amount *
        </label>
        <div className="relative">
          {selectedType && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              {getAmountPrefix(selectedType as TransactionType)}$
            </span>
          )}
          <input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('amount', { valueAsNumber: true })}
            className={clsx(
              'block w-full rounded-lg border pl-10 pr-4 py-2 focus:outline-none focus:ring-2',
              errors.amount ? 'border-red-500 focus:ring-red-500' : getAmountColor(selectedType as TransactionType)
            )}
            autoFocus
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      {/* Transaction Type */}
      <div>
        <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700 mb-2">
          Transaction Type *
        </label>
        <Controller
          name="transactionType"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3">
              {TRANSACTION_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={clsx(
                    'flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all',
                    field.value === type.value
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <input
                    type="radio"
                    {...field}
                    value={type.value}
                    checked={field.value === type.value}
                    className="sr-only"
                  />
                  <TransactionTypeIcon
                    type={type.value as TransactionType}
                    size="sm"
                  />
                  <span className="text-sm font-medium text-gray-900">{type.label}</span>
                </label>
              ))}
            </div>
          )}
        />
        {errors.transactionType && (
          <p className="mt-1 text-sm text-red-600">{errors.transactionType.message}</p>
        )}
      </div>

      {/* Date */}
      <div>
        <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700 mb-1">
          Date *
        </label>
        <input
          id="transactionDate"
          type="date"
          {...register('transactionDate')}
          className={clsx(
            'block w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2',
            errors.transactionDate
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-primary-500'
          )}
        />
        {errors.transactionDate && (
          <p className="mt-1 text-sm text-red-600">{errors.transactionDate.message as string}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="Add a note about this transaction..."
          {...register('description')}
          className={clsx(
            'block w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 resize-none',
            errors.description
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-primary-500'
          )}
          maxLength={500}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={isLoading} fullWidth={!onCancel}>
          {transaction ? 'Update Transaction' : 'Create Transaction'}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
