import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { asyncHandler } from '../middleware/errorHandler';
import * as accountController from '../controllers/account.controller';
import {
  createAccountSchema,
  updateAccountSchema,
} from '../validators/account.validator';

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * @route   GET /api/accounts
 * @desc    Get all accounts for authenticated user
 * @access  Protected
 */
router.get('/', asyncHandler(accountController.getAllAccounts));

/**
 * @route   GET /api/accounts/:id
 * @desc    Get account by ID
 * @access  Protected
 */
router.get('/:id', asyncHandler(accountController.getAccountById));

/**
 * @route   POST /api/accounts
 * @desc    Create new account
 * @access  Protected
 */
router.post(
  '/',
  validate(createAccountSchema),
  asyncHandler(accountController.createAccount)
);

/**
 * @route   PUT /api/accounts/:id
 * @desc    Update account
 * @access  Protected
 */
router.put(
  '/:id',
  validate(updateAccountSchema),
  asyncHandler(accountController.updateAccount)
);

/**
 * @route   DELETE /api/accounts/:id
 * @desc    Delete account (soft delete by default, ?hard=true for hard delete)
 * @access  Protected
 */
router.delete('/:id', asyncHandler(accountController.deleteAccount));

/**
 * @route   GET /api/accounts/:id/summary
 * @desc    Get account summary with analytics
 * @access  Protected
 */
router.get('/:id/summary', asyncHandler(accountController.getAccountSummary));

export default router;
