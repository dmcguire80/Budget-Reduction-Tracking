import { PrismaClient, Account, Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import {
  AccountFilters,
  AccountSummary,
  CreateAccountData,
  UpdateAccountData,
} from '../types/account';

const prisma = new PrismaClient();

/**
 * Get all accounts for a user with optional filters
 * @param userId - User ID
 * @param filters - Optional filters for accounts
 * @returns List of accounts with total count
 */
export const getAllAccounts = async (
  userId: string,
  filters?: AccountFilters
): Promise<{ accounts: Account[]; total: number }> => {
  // Build where clause
  const where: Prisma.AccountWhereInput = {
    userId,
  };

  if (filters?.accountType) {
    where.accountType = filters.accountType;
  }

  if (filters?.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  // Build order by clause
  const orderBy: Prisma.AccountOrderByWithRelationInput = {};
  const sortBy = filters?.sortBy || 'createdAt';
  const sortOrder = filters?.sortOrder || 'desc';

  if (sortBy === 'balance') {
    orderBy.currentBalance = sortOrder;
  } else {
    orderBy[sortBy] = sortOrder;
  }

  // Query accounts
  const [accounts, total] = await Promise.all([
    prisma.account.findMany({
      where,
      orderBy,
    }),
    prisma.account.count({ where }),
  ]);

  logger.info(`Retrieved ${accounts.length} accounts for user ${userId}`);

  return { accounts, total };
};

/**
 * Get a single account by ID
 * @param id - Account ID
 * @param userId - User ID (for ownership validation)
 * @returns Account object
 * @throws AppError if account not found or unauthorized
 */
export const getAccountById = async (
  id: string,
  userId: string
): Promise<Account> => {
  const account = await prisma.account.findUnique({
    where: { id },
  });

  if (!account) {
    throw new AppError('Account not found', 404);
  }

  if (account.userId !== userId) {
    throw new AppError('Unauthorized to access this account', 403);
  }

  return account;
};

/**
 * Create a new account
 * @param userId - User ID
 * @param data - Account creation data
 * @returns Created account
 */
export const createAccount = async (
  userId: string,
  data: CreateAccountData
): Promise<Account> => {
  // Use Prisma transaction to create account and initial snapshot
  const result = await prisma.$transaction(async (tx) => {
    // Create account
    const account = await tx.account.create({
      data: {
        userId,
        name: data.name,
        accountType: data.accountType,
        currentBalance: data.currentBalance,
        creditLimit: data.creditLimit,
        interestRate: data.interestRate,
        minimumPayment: data.minimumPayment,
        dueDay: data.dueDay,
      },
    });

    // Create initial snapshot
    await tx.snapshot.create({
      data: {
        accountId: account.id,
        balance: data.currentBalance,
        snapshotDate: new Date(),
        note: 'Initial balance snapshot',
      },
    });

    return account;
  });

  logger.info(`Account created: ${result.name}`, { accountId: result.id, userId });

  return result;
};

/**
 * Update an existing account
 * @param id - Account ID
 * @param userId - User ID (for ownership validation)
 * @param data - Account update data
 * @returns Updated account
 * @throws AppError if account not found or unauthorized
 */
export const updateAccount = async (
  id: string,
  userId: string,
  data: UpdateAccountData
): Promise<Account> => {
  // Verify ownership
  const existingAccount = await getAccountById(id, userId);

  // Check if balance changed
  const balanceChanged =
    data.currentBalance !== undefined &&
    data.currentBalance !== existingAccount.currentBalance.toNumber();

  // Use transaction if balance changed
  if (balanceChanged) {
    const result = await prisma.$transaction(async (tx) => {
      // Update account
      const updatedAccount = await tx.account.update({
        where: { id },
        data: {
          name: data.name,
          accountType: data.accountType,
          currentBalance: data.currentBalance,
          creditLimit: data.creditLimit,
          interestRate: data.interestRate,
          minimumPayment: data.minimumPayment,
          dueDay: data.dueDay,
          isActive: data.isActive,
        },
      });

      // Create snapshot for balance change
      await tx.snapshot.create({
        data: {
          accountId: id,
          balance: data.currentBalance!,
          snapshotDate: new Date(),
          note: 'Balance updated manually',
        },
      });

      return updatedAccount;
    });

    logger.info(`Account updated with balance change: ${id}`, { userId });
    return result;
  } else {
    // Update account without creating snapshot
    const updatedAccount = await prisma.account.update({
      where: { id },
      data: {
        name: data.name,
        accountType: data.accountType,
        creditLimit: data.creditLimit,
        interestRate: data.interestRate,
        minimumPayment: data.minimumPayment,
        dueDay: data.dueDay,
        isActive: data.isActive,
      },
    });

    logger.info(`Account updated: ${id}`, { userId });
    return updatedAccount;
  }
};

/**
 * Delete an account (soft delete by default)
 * @param id - Account ID
 * @param userId - User ID (for ownership validation)
 * @param hardDelete - If true, perform hard delete with cascade
 * @throws AppError if account not found or unauthorized
 */
export const deleteAccount = async (
  id: string,
  userId: string,
  hardDelete: boolean = false
): Promise<void> => {
  // Verify ownership
  await getAccountById(id, userId);

  if (hardDelete) {
    // Hard delete - Prisma will cascade delete transactions and snapshots
    await prisma.account.delete({
      where: { id },
    });

    logger.info(`Account hard deleted: ${id}`, { userId });
  } else {
    // Soft delete - set isActive to false
    await prisma.account.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info(`Account soft deleted: ${id}`, { userId });
  }
};

/**
 * Get account summary with analytics
 * @param id - Account ID
 * @param userId - User ID (for ownership validation)
 * @returns Account with analytics data
 * @throws AppError if account not found or unauthorized
 */
export const getAccountSummary = async (
  id: string,
  userId: string
): Promise<AccountSummary> => {
  // Verify ownership
  const account = await getAccountById(id, userId);

  // Get all transactions for analytics
  const transactions = await prisma.transaction.findMany({
    where: { accountId: id },
    orderBy: { transactionDate: 'asc' },
  });

  // Calculate analytics
  let totalPayments = 0;
  let totalCharges = 0;

  transactions.forEach((transaction) => {
    const amount = transaction.amount.toNumber();
    switch (transaction.transactionType) {
      case 'PAYMENT':
        totalPayments += amount;
        break;
      case 'CHARGE':
      case 'INTEREST':
        totalCharges += amount;
        break;
      case 'ADJUSTMENT':
        // Adjustments can be positive or negative
        // For analytics, we'll count positive adjustments as charges
        if (amount > 0) {
          totalCharges += amount;
        } else {
          totalPayments += Math.abs(amount);
        }
        break;
    }
  });

  const totalReduction = totalPayments - totalCharges;

  // Get first snapshot to calculate progress
  const firstSnapshot = await prisma.snapshot.findFirst({
    where: { accountId: id },
    orderBy: { snapshotDate: 'asc' },
  });

  const startingBalance = firstSnapshot
    ? firstSnapshot.balance.toNumber()
    : account.currentBalance.toNumber();

  const currentBalance = account.currentBalance.toNumber();

  // Calculate progress percentage (how much has been paid off)
  const progressPercentage =
    startingBalance > 0
      ? Math.max(0, Math.min(100, ((startingBalance - currentBalance) / startingBalance) * 100))
      : 0;

  // Calculate average monthly reduction
  const firstTransactionDate = transactions.length > 0
    ? new Date(transactions[0].transactionDate)
    : new Date(account.createdAt);

  const monthsElapsed = Math.max(
    1,
    (new Date().getTime() - firstTransactionDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  const averageMonthlyReduction = totalReduction / monthsElapsed;

  // Calculate projected debt-free date
  let projectedDebtFreeDate: Date | null = null;
  if (averageMonthlyReduction > 0 && currentBalance > 0) {
    const monthsRemaining = currentBalance / averageMonthlyReduction;
    projectedDebtFreeDate = new Date();
    projectedDebtFreeDate.setMonth(projectedDebtFreeDate.getMonth() + Math.ceil(monthsRemaining));
  }

  logger.info(`Account summary retrieved: ${id}`, { userId });

  return {
    account,
    analytics: {
      totalPayments,
      totalCharges,
      totalReduction,
      progressPercentage,
      averageMonthlyReduction,
      projectedDebtFreeDate,
    },
  };
};
