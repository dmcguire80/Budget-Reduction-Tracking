import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { asyncHandler } from '../middleware/errorHandler';
import * as transactionController from '../controllers/transaction.controller';
import {
  createTransactionSchema,
  updateTransactionSchema,
} from '../validators/transaction.validator';

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions for authenticated user across all accounts
 * @access  Protected
 */
router.get('/transactions', asyncHandler(transactionController.getAllTransactions));

/**
 * @route   GET /api/accounts/:accountId/transactions
 * @desc    Get all transactions for a specific account
 * @access  Protected
 */
router.get(
  '/accounts/:accountId/transactions',
  asyncHandler(transactionController.getAccountTransactions)
);

/**
 * @route   POST /api/accounts/:accountId/transactions
 * @desc    Create new transaction for an account
 * @access  Protected
 */
router.post(
  '/accounts/:accountId/transactions',
  validate(createTransactionSchema),
  asyncHandler(transactionController.createTransaction)
);

/**
 * @route   PUT /api/transactions/:id
 * @desc    Update transaction
 * @access  Protected
 */
router.put(
  '/transactions/:id',
  validate(updateTransactionSchema),
  asyncHandler(transactionController.updateTransaction)
);

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete transaction
 * @access  Protected
 */
router.delete('/transactions/:id', asyncHandler(transactionController.deleteTransaction));

export default router;
