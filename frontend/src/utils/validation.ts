/**
 * Validation Utilities
 *
 * Common Zod validation schemas for forms
 */

import { z } from 'zod';
import { VALIDATION } from '@config/constants';

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .regex(VALIDATION.EMAIL_REGEX, 'Invalid email format');

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`)
  .max(VALIDATION.PASSWORD_MAX_LENGTH, `Password must be less than ${VALIDATION.PASSWORD_MAX_LENGTH} characters`)
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(VALIDATION.NAME_MIN_LENGTH, `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`)
  .max(VALIDATION.NAME_MAX_LENGTH, `Name must be less than ${VALIDATION.NAME_MAX_LENGTH} characters`)
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

/**
 * Required string schema
 */
export const requiredString = (fieldName: string) =>
  z.string().min(1, `${fieldName} is required`);

/**
 * Optional string schema
 */
export const optionalString = () => z.string().optional().or(z.literal(''));

/**
 * Positive number schema
 */
export const positiveNumber = (fieldName: string) =>
  z.number().positive(`${fieldName} must be a positive number`);

/**
 * Non-negative number schema
 */
export const nonNegativeNumber = (fieldName: string) =>
  z.number().min(0, `${fieldName} must be zero or greater`);

/**
 * Number range schema
 */
export const numberInRange = (fieldName: string, min: number, max: number) =>
  z
    .number()
    .min(min, `${fieldName} must be at least ${min}`)
    .max(max, `${fieldName} must be at most ${max}`);

/**
 * Currency amount schema (positive)
 */
export const currencyAmount = z
  .number()
  .positive('Amount must be greater than zero')
  .multipleOf(0.01, 'Amount can have at most 2 decimal places');

/**
 * Currency amount schema (can be negative for transactions)
 */
export const transactionAmount = z
  .number()
  .multipleOf(0.01, 'Amount can have at most 2 decimal places')
  .refine((val) => val !== 0, 'Amount cannot be zero');

/**
 * Interest rate schema (0-100%)
 */
export const interestRateSchema = z
  .number()
  .min(0, 'Interest rate must be at least 0%')
  .max(100, 'Interest rate must be at most 100%')
  .multipleOf(0.01, 'Interest rate can have at most 2 decimal places');

/**
 * Date schema (future date)
 */
export const futureDate = z
  .date()
  .refine((date) => date > new Date(), 'Date must be in the future');

/**
 * Date schema (past date)
 */
export const pastDate = z
  .date()
  .refine((date) => date < new Date(), 'Date must be in the past');

/**
 * Due day schema (1-31)
 */
export const dueDaySchema = z
  .number()
  .int('Due day must be a whole number')
  .min(1, 'Due day must be between 1 and 31')
  .max(31, 'Due day must be between 1 and 31');

/**
 * Description schema
 */
export const descriptionSchema = z
  .string()
  .max(VALIDATION.DESCRIPTION_MAX_LENGTH, `Description must be less than ${VALIDATION.DESCRIPTION_MAX_LENGTH} characters`)
  .optional();

/**
 * UUID schema
 */
export const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * Check if a password is strong
 * @param password - The password to check
 * @returns Object with strength score and feedback
 */
export const checkPasswordStrength = (
  password: string
): { score: number; feedback: string[] } => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= VALIDATION.PASSWORD_MIN_LENGTH) {
    score += 20;
  } else {
    feedback.push(`At least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`);
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 20;
  } else {
    feedback.push('One lowercase letter');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 20;
  } else {
    feedback.push('One uppercase letter');
  }

  // Number check
  if (/[0-9]/.test(password)) {
    score += 20;
  } else {
    feedback.push('One number');
  }

  // Special character check
  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 20;
  } else {
    feedback.push('One special character');
  }

  return { score, feedback };
};

/**
 * Validate email format (simple check)
 * @param email - The email to validate
 * @returns True if valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  return VALIDATION.EMAIL_REGEX.test(email);
};

/**
 * Sanitize HTML to prevent XSS (basic)
 * @param html - The HTML string to sanitize
 * @returns Sanitized string
 */
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};
