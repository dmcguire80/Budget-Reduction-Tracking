/**
 * Transaction Validation Schemas
 *
 * Zod schemas for validating transaction forms
 */

import { z } from 'zod';
import { VALIDATION } from '@config/constants';

/**
 * Transaction type enum schema
 */
export const transactionTypeSchema = z.enum(['PAYMENT', 'CHARGE', 'ADJUSTMENT', 'INTEREST'], {
  errorMap: () => ({ message: 'Please select a valid transaction type' }),
});

/**
 * Transaction schema for create/edit forms
 */
export const transactionSchema = z.object({
  amount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount is too large'),
  transactionType: transactionTypeSchema,
  transactionDate: z
    .union([z.string(), z.date()], {
      errorMap: () => ({ message: 'Valid date is required' }),
    })
    .refine(
      (val) => {
        if (typeof val === 'string') {
          return !isNaN(Date.parse(val));
        }
        return val instanceof Date && !isNaN(val.getTime());
      },
      { message: 'Invalid date format' }
    ),
  description: z
    .string()
    .max(VALIDATION.DESCRIPTION_MAX_LENGTH, `Description must be at most ${VALIDATION.DESCRIPTION_MAX_LENGTH} characters`)
    .optional()
    .nullable(),
});

/**
 * Quick transaction schema (simplified for quick entry)
 */
export const quickTransactionSchema = z.object({
  amount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount is too large'),
  transactionType: z.enum(['PAYMENT', 'CHARGE']),
  description: z.string().max(VALIDATION.DESCRIPTION_MAX_LENGTH).optional().nullable(),
});

/**
 * Transaction filter schema
 */
export const transactionFilterSchema = z.object({
  transactionType: transactionTypeSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().min(0).optional(),
});

/**
 * Type inference for transaction form
 */
export type TransactionFormValues = z.infer<typeof transactionSchema>;

/**
 * Type inference for quick transaction form
 */
export type QuickTransactionFormValues = z.infer<typeof quickTransactionSchema>;

/**
 * Type inference for transaction filters
 */
export type TransactionFilterValues = z.infer<typeof transactionFilterSchema>;
