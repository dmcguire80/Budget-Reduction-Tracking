import { PrismaClient, Snapshot, Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { getAccountById } from './account.service';

const prisma = new PrismaClient();

/**
 * Snapshot filter options
 */
interface SnapshotFilters {
  startDate?: Date;
  endDate?: Date;
}

/**
 * Chart data format for frontend visualization
 */
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    balanceReductions: number[];
  }[];
}

/**
 * Get all snapshots for an account
 * @param accountId - Account ID
 * @param userId - User ID (for ownership validation)
 * @param filters - Optional date range filters
 * @returns List of snapshots
 * @throws AppError if account not found or unauthorized
 */
export const getAccountSnapshots = async (
  accountId: string,
  userId: string,
  filters?: SnapshotFilters
): Promise<Snapshot[]> => {
  // Verify user owns the account
  await getAccountById(accountId, userId);

  // Build where clause
  const where: Prisma.SnapshotWhereInput = {
    accountId,
  };

  if (filters?.startDate || filters?.endDate) {
    where.snapshotDate = {};
    if (filters.startDate) {
      where.snapshotDate.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.snapshotDate.lte = filters.endDate;
    }
  }

  // Query snapshots
  const snapshots = await prisma.snapshot.findMany({
    where,
    orderBy: { snapshotDate: 'asc' },
  });

  logger.info(`Retrieved ${snapshots.length} snapshots for account ${accountId}`);

  return snapshots;
};

/**
 * Create a manual snapshot
 * @param accountId - Account ID
 * @param userId - User ID (for ownership validation)
 * @param data - Snapshot data (balance, date, note)
 * @returns Created snapshot
 * @throws AppError if account not found or unauthorized
 */
export const createSnapshot = async (
  accountId: string,
  userId: string,
  data: {
    balance?: number;
    snapshotDate?: Date;
    note?: string | null;
  }
): Promise<Snapshot> => {
  // Verify user owns the account
  const account = await getAccountById(accountId, userId);

  // Use account's current balance if not provided
  const balance = data.balance !== undefined
    ? data.balance
    : account.currentBalance.toNumber();

  // Use current date if not provided
  const snapshotDate = data.snapshotDate || new Date();

  // Create snapshot
  const snapshot = await prisma.snapshot.create({
    data: {
      accountId,
      balance,
      snapshotDate,
      note: data.note,
    },
  });

  logger.info(`Manual snapshot created for account ${accountId}`, {
    snapshotId: snapshot.id,
    userId,
  });

  return snapshot;
};

/**
 * Delete a snapshot
 * @param id - Snapshot ID
 * @param userId - User ID (for ownership validation)
 * @throws AppError if snapshot not found or unauthorized
 */
export const deleteSnapshot = async (
  id: string,
  userId: string
): Promise<void> => {
  // Get snapshot with account info
  const snapshot = await prisma.snapshot.findUnique({
    where: { id },
    include: { account: true },
  });

  if (!snapshot) {
    throw new AppError('Snapshot not found', 404);
  }

  // Verify user owns the account
  if (snapshot.account.userId !== userId) {
    throw new AppError('Unauthorized to access this snapshot', 403);
  }

  // Delete snapshot
  await prisma.snapshot.delete({
    where: { id },
  });

  logger.info(`Snapshot deleted: ${id}`, { userId });
};

/**
 * Get chart data formatted for Chart.js
 * @param accountId - Account ID
 * @param userId - User ID (for ownership validation)
 * @param filters - Optional date range filters
 * @returns Chart data with labels and datasets
 * @throws AppError if account not found or unauthorized
 */
export const getChartData = async (
  accountId: string,
  userId: string,
  filters?: SnapshotFilters
): Promise<ChartData> => {
  // Get snapshots
  const snapshots = await getAccountSnapshots(accountId, userId, filters);

  // Format data for Chart.js
  const labels: string[] = [];
  const data: number[] = [];
  const balanceReductions: number[] = [];

  let previousBalance: number | null = null;

  snapshots.forEach((snapshot) => {
    // Format date as YYYY-MM-DD
    const date = new Date(snapshot.snapshotDate);
    const formattedDate = date.toISOString().split('T')[0];
    labels.push(formattedDate);

    // Add balance data
    const balance = snapshot.balance.toNumber();
    data.push(balance);

    // Calculate reduction from previous snapshot
    if (previousBalance !== null) {
      const reduction = previousBalance - balance;
      balanceReductions.push(reduction);
    } else {
      balanceReductions.push(0);
    }

    previousBalance = balance;
  });

  logger.info(`Chart data retrieved for account ${accountId}`, {
    dataPoints: snapshots.length,
  });

  return {
    labels,
    datasets: [
      {
        label: 'Account Balance',
        data,
        balanceReductions,
      },
    ],
  };
};
