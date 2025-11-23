/**
 * Account Validation Schemas
 *
 * Zod schemas for account form validation
 */

import { z } from 'zod';
import { AccountType } from '@types';

/**
 * Account schema for create/update operations
 */
export const accountSchema = z.object({
  name: z
    .string()
    .min(1, 'Account name is required')
    .max(100, 'Account name must be 100 characters or less')
    .trim(),

  accountType: z.nativeEnum(AccountType, {
    required_error: 'Account type is required',
    invalid_type_error: 'Invalid account type',
  }),

  currentBalance: z
    .number({
      required_error: 'Current balance is required',
      invalid_type_error: 'Current balance must be a number',
    })
    .min(0, 'Current balance cannot be negative'),

  creditLimit: z
    .number()
    .min(0, 'Credit limit cannot be negative')
    .nullable()
    .optional(),

  interestRate: z
    .number({
      required_error: 'Interest rate is required',
      invalid_type_error: 'Interest rate must be a number',
    })
    .min(0, 'Interest rate cannot be negative')
    .max(100, 'Interest rate cannot exceed 100%'),

  minimumPayment: z
    .number()
    .min(0, 'Minimum payment cannot be negative')
    .nullable()
    .optional(),

  dueDay: z
    .number()
    .int('Due day must be a whole number')
    .min(1, 'Due day must be between 1 and 31')
    .max(31, 'Due day must be between 1 and 31')
    .nullable()
    .optional(),
});

/**
 * Account form values type
 */
export type AccountFormValues = z.infer<typeof accountSchema>;

/**
 * Partial account schema for updates (all fields optional except name)
 */
export const updateAccountSchema = accountSchema.partial().extend({
  name: z.string().min(1, 'Account name is required').optional(),
});

/**
 * Account filter schema
 */
export const accountFilterSchema = z.object({
  accountType: z.nativeEnum(AccountType).optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'balance', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type AccountFilterValues = z.infer<typeof accountFilterSchema>;
