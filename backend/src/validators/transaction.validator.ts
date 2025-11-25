import { z } from 'zod';

/**
 * Transaction creation validation schema
 */
export const createTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  transactionType: z.enum(['PAYMENT', 'CHARGE', 'ADJUSTMENT', 'INTEREST'], {
    errorMap: () => ({ message: 'Invalid transaction type' }),
  }),
  transactionDate: z.string().datetime().or(z.date()).transform((val) => {
    return typeof val === 'string' ? new Date(val) : val;
  }),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional().nullable(),
});

/**
 * Transaction update validation schema
 * All fields are optional for partial updates
 */
export const updateTransactionSchema = createTransactionSchema.partial();

/**
 * Transaction query filters validation schema
 */
export const transactionFiltersSchema = z.object({
  transactionType: z.enum(['PAYMENT', 'CHARGE', 'ADJUSTMENT', 'INTEREST']).optional(),
  startDate: z.string().datetime().or(z.date()).transform((val) => {
    return typeof val === 'string' ? new Date(val) : val;
  }).optional(),
  endDate: z.string().datetime().or(z.date()).transform((val) => {
    return typeof val === 'string' ? new Date(val) : val;
  }).optional(),
  limit: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive()).optional().default('50'),
  offset: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().min(0)).optional().default('0'),
});

// Export types inferred from schemas
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFiltersInput = z.infer<typeof transactionFiltersSchema>;
