import { PrismaClient, Transaction, Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import {
  TransactionFilters,
  CreateTransactionData,
  UpdateTransactionData,
} from '../types/transaction';
import { getAccountById } from './account.service';

const prisma = new PrismaClient();

/**
 * Calculate new balance based on transaction type and amount
 * @param currentBalance - Current account balance
 * @param amount - Transaction amount
 * @param transactionType - Type of transaction
 * @returns New balance
 */
const calculateNewBalance = (
  currentBalance: number,
  amount: number,
  transactionType: string
): number => {
  switch (transactionType) {
    case 'PAYMENT':
      return currentBalance - amount;
    case 'CHARGE':
    case 'INTEREST':
      return currentBalance + amount;
    case 'ADJUSTMENT':
      // For adjustments, the amount itself determines the direction
      // Positive adjustment increases balance, negative decreases
      return currentBalance + amount;
    default:
      return currentBalance;
  }
};

/**
 * Get all transactions for an account
 * @param accountId - Account ID
 * @param userId - User ID (for ownership validation)
 * @param filters - Optional filters
 * @returns List of transactions with total count
 * @throws AppError if account not found or unauthorized
 */
export const getAccountTransactions = async (
  accountId: string,
  userId: string,
  filters?: TransactionFilters
): Promise<{ transactions: Transaction[]; total: number }> => {
  // Verify user owns the account
  await getAccountById(accountId, userId);

  // Build where clause
  const where: Prisma.TransactionWhereInput = {
    accountId,
  };

  if (filters?.transactionType) {
    where.transactionType = filters.transactionType;
  }

  if (filters?.startDate || filters?.endDate) {
    where.transactionDate = {};
    if (filters.startDate) {
      where.transactionDate.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.transactionDate.lte = filters.endDate;
    }
  }

  // Query transactions with pagination
  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { transactionDate: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  logger.info(`Retrieved ${transactions.length} transactions for account ${accountId}`);

  return { transactions, total };
};

/**
 * Create a new transaction
 * @param accountId - Account ID
 * @param userId - User ID (for ownership validation)
 * @param data - Transaction creation data
 * @returns Created transaction
 * @throws AppError if account not found or unauthorized
 */
export const createTransaction = async (
  accountId: string,
  userId: string,
  data: CreateTransactionData
): Promise<Transaction> => {
  // Verify user owns the account
  const account = await getAccountById(accountId, userId);

  // Calculate new balance
  const currentBalance = account.currentBalance.toNumber();
  const newBalance = calculateNewBalance(
    currentBalance,
    data.amount,
    data.transactionType
  );

  // Use Prisma transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Create transaction
    const transaction = await tx.transaction.create({
      data: {
        accountId,
        amount: data.amount,
        transactionType: data.transactionType,
        transactionDate: data.transactionDate,
        description: data.description,
      },
    });

    // Update account balance
    await tx.account.update({
      where: { id: accountId },
      data: { currentBalance: newBalance },
    });

    // Create automatic snapshot
    await tx.snapshot.create({
      data: {
        accountId,
        balance: newBalance,
        snapshotDate: data.transactionDate,
        note: `Auto-snapshot after ${data.transactionType}`,
      },
    });

    return transaction;
  });

  logger.info(`Transaction created for account ${accountId}`, {
    transactionId: result.id,
    userId,
    type: data.transactionType,
    amount: data.amount,
  });

  return result;
};

/**
 * Update an existing transaction
 * @param id - Transaction ID
 * @param userId - User ID (for ownership validation)
 * @param data - Transaction update data
 * @returns Updated transaction
 * @throws AppError if transaction not found or unauthorized
 */
export const updateTransaction = async (
  id: string,
  userId: string,
  data: UpdateTransactionData
): Promise<Transaction> => {
  // Get existing transaction
  const existingTransaction = await prisma.transaction.findUnique({
    where: { id },
    include: { account: true },
  });

  if (!existingTransaction) {
    throw new AppError('Transaction not found', 404);
  }

  // Verify user owns the account
  if (existingTransaction.account.userId !== userId) {
    throw new AppError('Unauthorized to access this transaction', 403);
  }

  // Calculate balance adjustment
  const oldAmount = existingTransaction.amount.toNumber();
  const oldType = existingTransaction.transactionType;
  const newAmount = data.amount !== undefined ? data.amount : oldAmount;
  const newType = data.transactionType || oldType;

  const currentBalance = existingTransaction.account.currentBalance.toNumber();

  // Reverse old transaction effect
  let adjustedBalance = currentBalance;
  switch (oldType) {
    case 'PAYMENT':
      adjustedBalance += oldAmount;
      break;
    case 'CHARGE':
    case 'INTEREST':
      adjustedBalance -= oldAmount;
      break;
    case 'ADJUSTMENT':
      adjustedBalance -= oldAmount;
      break;
  }

  // Apply new transaction effect
  const newBalance = calculateNewBalance(adjustedBalance, newAmount, newType);

  // Use Prisma transaction for atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Update transaction
    const updatedTransaction = await tx.transaction.update({
      where: { id },
      data: {
        amount: data.amount,
        transactionType: data.transactionType,
        transactionDate: data.transactionDate,
        description: data.description,
      },
    });

    // Update account balance
    await tx.account.update({
      where: { id: existingTransaction.accountId },
      data: { currentBalance: newBalance },
    });

    // Create snapshot for balance recalculation
    await tx.snapshot.create({
      data: {
        accountId: existingTransaction.accountId,
        balance: newBalance,
        snapshotDate: data.transactionDate || existingTransaction.transactionDate,
        note: `Balance recalculated after transaction update`,
      },
    });

    return updatedTransaction;
  });

  logger.info(`Transaction updated: ${id}`, { userId });

  return result;
};

/**
 * Delete a transaction
 * @param id - Transaction ID
 * @param userId - User ID (for ownership validation)
 * @throws AppError if transaction not found or unauthorized
 */
export const deleteTransaction = async (
  id: string,
  userId: string
): Promise<void> => {
  // Get existing transaction
  const existingTransaction = await prisma.transaction.findUnique({
    where: { id },
    include: { account: true },
  });

  if (!existingTransaction) {
    throw new AppError('Transaction not found', 404);
  }

  // Verify user owns the account
  if (existingTransaction.account.userId !== userId) {
    throw new AppError('Unauthorized to access this transaction', 403);
  }

  // Calculate balance adjustment (reverse the transaction)
  const amount = existingTransaction.amount.toNumber();
  const transactionType = existingTransaction.transactionType;
  const currentBalance = existingTransaction.account.currentBalance.toNumber();

  let newBalance = currentBalance;
  switch (transactionType) {
    case 'PAYMENT':
      newBalance += amount;
      break;
    case 'CHARGE':
    case 'INTEREST':
      newBalance -= amount;
      break;
    case 'ADJUSTMENT':
      newBalance -= amount;
      break;
  }

  // Use Prisma transaction for atomicity
  await prisma.$transaction(async (tx) => {
    // Delete transaction
    await tx.transaction.delete({
      where: { id },
    });

    // Update account balance
    await tx.account.update({
      where: { id: existingTransaction.accountId },
      data: { currentBalance: newBalance },
    });

    // Create snapshot for balance recalculation
    await tx.snapshot.create({
      data: {
        accountId: existingTransaction.accountId,
        balance: newBalance,
        snapshotDate: new Date(),
        note: `Balance recalculated after transaction deletion`,
      },
    });
  });

  logger.info(`Transaction deleted: ${id}`, { userId });
};

/**
 * Get all transactions for a user across all accounts
 * @param userId - User ID
 * @param filters - Optional filters
 * @returns List of transactions with total count
 */
export const getAllTransactions = async (
  userId: string,
  filters?: TransactionFilters
): Promise<{ transactions: Transaction[]; total: number }> => {
  // Build where clause
  const where: Prisma.TransactionWhereInput = {
    account: {
      userId,
    },
  };

  if (filters?.transactionType) {
    where.transactionType = filters.transactionType;
  }

  if (filters?.startDate || filters?.endDate) {
    where.transactionDate = {};
    if (filters.startDate) {
      where.transactionDate.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.transactionDate.lte = filters.endDate;
    }
  }

  // Query transactions with pagination
  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        account: {
          select: {
            id: true,
            name: true,
            accountType: true,
          },
        },
      },
      orderBy: { transactionDate: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  logger.info(`Retrieved ${transactions.length} transactions for user ${userId}`);

  return { transactions, total };
};
