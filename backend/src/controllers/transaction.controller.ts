import { Request, Response, NextFunction } from 'express';
import * as transactionService from '../services/transaction.service';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFiltersInput,
} from '../validators/transaction.validator';

/**
 * Get all transactions for an account
 * @route GET /api/accounts/:accountId/transactions
 */
export const getAccountTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { accountId } = req.params;
    const filters = req.query as unknown as TransactionFiltersInput;

    const result = await transactionService.getAccountTransactions(
      accountId,
      userId,
      filters
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new transaction
 * @route POST /api/accounts/:accountId/transactions
 */
export const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { accountId } = req.params;
    const data = req.body as CreateTransactionInput;

    const transaction = await transactionService.createTransaction(
      accountId,
      userId,
      data
    );

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing transaction
 * @route PUT /api/transactions/:id
 */
export const updateTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const data = req.body as UpdateTransactionInput;

    const transaction = await transactionService.updateTransaction(
      id,
      userId,
      data
    );

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a transaction
 * @route DELETE /api/transactions/:id
 */
export const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await transactionService.deleteTransaction(id, userId);

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all transactions for the authenticated user across all accounts
 * @route GET /api/transactions
 */
export const getAllTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const filters = req.query as unknown as TransactionFiltersInput;

    const result = await transactionService.getAllTransactions(userId, filters);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
