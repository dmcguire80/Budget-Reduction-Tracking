/**
 * Quick Transaction Form Component
 *
 * Simplified form for quick transaction entry
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { quickTransactionSchema, QuickTransactionFormValues } from '@validators/transaction.schemas';
import { TransactionType } from '@/types/transaction.types';
import Button from '@components/common/Button';

export interface QuickTransactionFormProps {
  accountId: string;
  onSubmit: (data: QuickTransactionFormValues) => void;
  isLoading?: boolean;
}

const QuickTransactionForm = ({
  accountId,
  onSubmit,
  isLoading = false,
}: QuickTransactionFormProps) => {
  const [selectedType, setSelectedType] = useState<TransactionType>(TransactionType.PAYMENT);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuickTransactionFormValues>({
    resolver: zodResolver(quickTransactionSchema),
    defaultValues: {
      amount: 0,
      transactionType: TransactionType.PAYMENT,
      description: '',
    },
  });

  const handleTypeToggle = (type: TransactionType) => {
    setSelectedType(type);
  };

  const handleFormSubmit = (data: QuickTransactionFormValues) => {
    onSubmit({ ...data, transactionType: selectedType });
    reset();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(handleFormSubmit)();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {/* Type Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleTypeToggle(TransactionType.PAYMENT)}
            className={clsx(
              'flex-1 px-4 py-2 rounded-lg font-medium transition-all',
              selectedType === TransactionType.PAYMENT
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Payment
          </button>
          <button
            type="button"
            onClick={() => handleTypeToggle(TransactionType.CHARGE)}
            className={clsx(
              'flex-1 px-4 py-2 rounded-lg font-medium transition-all',
              selectedType === TransactionType.CHARGE
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Charge
          </button>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <div className="relative">
            <span
              className={clsx(
                'absolute left-3 top-1/2 -translate-y-1/2 font-bold text-lg',
                selectedType === TransactionType.PAYMENT ? 'text-green-600' : 'text-red-600'
              )}
            >
              {selectedType === TransactionType.PAYMENT ? '-' : '+'}$
            </span>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount', { valueAsNumber: true })}
              onKeyDown={handleKeyDown}
              className={clsx(
                'block w-full rounded-lg border-2 pl-12 pr-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2',
                errors.amount
                  ? 'border-red-500 focus:ring-red-500'
                  : selectedType === TransactionType.PAYMENT
                  ? 'border-green-500 focus:ring-green-500'
                  : 'border-red-500 focus:ring-red-500'
              )}
              autoFocus
            />
          </div>
          {errors.amount && (
            <p className="text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>

        {/* Optional Description */}
        <div className="mt-3">
          <input
            type="text"
            placeholder="Description (optional)"
            {...register('description')}
            onKeyDown={handleKeyDown}
            className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            maxLength={500}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-4">
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            fullWidth
          >
            Add {selectedType === TransactionType.PAYMENT ? 'Payment' : 'Charge'}
          </Button>
        </div>

        {/* Helper Text */}
        <p className="mt-2 text-xs text-gray-500 text-center">
          Press Enter to quickly submit
        </p>
      </div>
    </form>
  );
};

export default QuickTransactionForm;
