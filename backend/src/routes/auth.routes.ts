import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../validators/auth.validator';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(authController.register)
);

/**
 * POST /api/auth/login
 * Login user with email and password
 */
router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(authController.login)
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  asyncHandler(authController.refresh)
);

/**
 * POST /api/auth/logout
 * Logout current user (requires authentication)
 */
router.post(
  '/logout',
  asyncHandler(requireAuth),
  asyncHandler(authController.logout)
);

/**
 * GET /api/auth/me
 * Get current user information (requires authentication)
 */
router.get(
  '/me',
  asyncHandler(requireAuth),
  asyncHandler(authController.getCurrentUser)
);

export default router;
