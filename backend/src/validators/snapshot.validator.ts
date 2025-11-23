import { z } from 'zod';

/**
 * Snapshot creation validation schema
 */
export const createSnapshotSchema = z.object({
  balance: z.number().min(0, 'Balance must be non-negative').optional(),
  snapshotDate: z.string().datetime().or(z.date()).transform((val) => {
    return typeof val === 'string' ? new Date(val) : val;
  }).optional(),
  note: z.string().max(500, 'Note must not exceed 500 characters').optional().nullable(),
});

/**
 * Snapshot date range filter validation schema
 */
export const snapshotFiltersSchema = z.object({
  startDate: z.string().datetime().or(z.date()).transform((val) => {
    return typeof val === 'string' ? new Date(val) : val;
  }).optional(),
  endDate: z.string().datetime().or(z.date()).transform((val) => {
    return typeof val === 'string' ? new Date(val) : val;
  }).optional(),
});

// Export types inferred from schemas
export type CreateSnapshotInput = z.infer<typeof createSnapshotSchema>;
export type SnapshotFiltersInput = z.infer<typeof snapshotFiltersSchema>;
