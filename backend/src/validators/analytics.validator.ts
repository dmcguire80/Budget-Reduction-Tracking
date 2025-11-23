import { z } from 'zod';

/**
 * Validation schema for projection request
 */
export const projectionRequestSchema = z.object({
  accountId: z.string().uuid('Invalid account ID format'),
  monthlyPayment: z.number().positive('Monthly payment must be positive'),
  extraPayment: z.number().min(0, 'Extra payment cannot be negative').optional(),
});

/**
 * Validation schema for custom projection calculation
 */
export const customProjectionSchema = z.object({
  monthlyPayment: z.number().positive('Monthly payment must be positive'),
});

/**
 * Validation schema for date range
 */
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().or(z.coerce.date()),
  endDate: z.string().datetime().or(z.coerce.date()),
});

/**
 * Validation schema for trend analysis request
 */
export const trendAnalysisSchema = z.object({
  period: z.enum(['month', 'quarter', 'year'], {
    errorMap: () => ({ message: 'Period must be month, quarter, or year' }),
  }).optional().default('month'),
});

/**
 * Validation schema for interest forecast request
 */
export const interestForecastSchema = z.object({
  months: z.number().int().min(1).max(600).optional().default(12),
});

/**
 * Validation schema for chart data date range query
 */
export const chartDateRangeSchema = z.object({
  startDate: z.string().datetime().or(z.coerce.date()).optional(),
  endDate: z.string().datetime().or(z.coerce.date()).optional(),
});

/**
 * Validation schema for required payment calculation
 */
export const requiredPaymentSchema = z.object({
  targetMonths: z.number().int().positive('Target months must be positive'),
});

/**
 * Validation schema for account ID parameter
 */
export const accountIdParamSchema = z.object({
  id: z.string().uuid('Invalid account ID format'),
});

/**
 * Validation schema for lookback period
 */
export const lookbackPeriodSchema = z.object({
  months: z.number().int().min(1).max(60).optional().default(12),
});

// Export inferred types
export type ProjectionRequestInput = z.infer<typeof projectionRequestSchema>;
export type CustomProjectionInput = z.infer<typeof customProjectionSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type TrendAnalysisInput = z.infer<typeof trendAnalysisSchema>;
export type InterestForecastInput = z.infer<typeof interestForecastSchema>;
export type ChartDateRangeInput = z.infer<typeof chartDateRangeSchema>;
export type RequiredPaymentInput = z.infer<typeof requiredPaymentSchema>;
export type AccountIdParamInput = z.infer<typeof accountIdParamSchema>;
export type LookbackPeriodInput = z.infer<typeof lookbackPeriodSchema>;
