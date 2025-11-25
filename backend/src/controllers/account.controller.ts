import { Request, Response, NextFunction } from 'express';
import * as accountService from '../services/account.service';
import {
  CreateAccountInput,
  UpdateAccountInput,
  AccountFiltersInput,
} from '../validators/account.validator';

/**
 * Get all accounts for the authenticated user
 * @route GET /api/accounts
 */
export const getAllAccounts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const filters = req.query as unknown as AccountFiltersInput;

    const result = await accountService.getAllAccounts(userId, filters);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single account by ID
 * @route GET /api/accounts/:id
 */
export const getAccountById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const account = await accountService.getAccountById(id, userId);

    res.status(200).json({
      success: true,
      data: { account },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new account
 * @route POST /api/accounts
 */
export const createAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = req.body as CreateAccountInput;

    const account = await accountService.createAccount(userId, data);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { account },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing account
 * @route PUT /api/accounts/:id
 */
export const updateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const data = req.body as UpdateAccountInput;

    const account = await accountService.updateAccount(id, userId, data);

    res.status(200).json({
      success: true,
      message: 'Account updated successfully',
      data: { account },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an account
 * @route DELETE /api/accounts/:id
 */
export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const hardDelete = req.query.hard === 'true';

    await accountService.deleteAccount(id, userId, hardDelete);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get account summary with analytics
 * @route GET /api/accounts/:id/summary
 */
export const getAccountSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const summary = await accountService.getAccountSummary(id, userId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};
