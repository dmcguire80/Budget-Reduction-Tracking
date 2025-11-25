/**
 * Authentication Validation Schemas
 *
 * Zod schemas for validating authentication forms
 */

import { z } from 'zod';
import { VALIDATION } from '@config/constants';

/**
 * Email schema
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .toLowerCase()
  .trim();

/**
 * Name schema
 */
export const nameSchema = z
  .string()
  .min(VALIDATION.NAME_MIN_LENGTH, `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`)
  .max(VALIDATION.NAME_MAX_LENGTH, `Name must be at most ${VALIDATION.NAME_MAX_LENGTH} characters`)
  .trim();

/**
 * Password schema with strength requirements
 */
export const passwordSchema = z
  .string()
  .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`)
  .max(VALIDATION.PASSWORD_MAX_LENGTH, `Password must be at most ${VALIDATION.PASSWORD_MAX_LENGTH} characters`)
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Register schema with password confirmation
 */
export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * Type inference for login form
 */
export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Type inference for register form
 */
export type RegisterFormData = z.infer<typeof registerSchema>;
