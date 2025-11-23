import { z } from 'zod';

/**
 * Account creation validation schema
 */
export const createAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must not exceed 100 characters'),
  accountType: z.enum(['CREDIT_CARD', 'PERSONAL_LOAN', 'AUTO_LOAN', 'MORTGAGE', 'STUDENT_LOAN', 'OTHER'], {
    errorMap: () => ({ message: 'Invalid account type' }),
  }),
  currentBalance: z.number().min(0, 'Current balance must be non-negative'),
  creditLimit: z.number().min(0, 'Credit limit must be non-negative').optional().nullable(),
  interestRate: z.number().min(0, 'Interest rate must be non-negative').max(100, 'Interest rate must not exceed 100'),
  minimumPayment: z.number().min(0, 'Minimum payment must be non-negative').optional().nullable(),
  dueDay: z.number().int().min(1, 'Due day must be between 1 and 31').max(31, 'Due day must be between 1 and 31').optional().nullable(),
});

/**
 * Account update validation schema
 * All fields are optional for partial updates
 */
export const updateAccountSchema = createAccountSchema.partial();

/**
 * Account query filters validation schema
 */
export const accountFiltersSchema = z.object({
  accountType: z.enum(['CREDIT_CARD', 'PERSONAL_LOAN', 'AUTO_LOAN', 'MORTGAGE', 'STUDENT_LOAN', 'OTHER']).optional(),
  isActive: z.string().transform((val) => val === 'true').optional(),
  sortBy: z.enum(['name', 'balance', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Export types inferred from schemas
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type AccountFiltersInput = z.infer<typeof accountFiltersSchema>;
