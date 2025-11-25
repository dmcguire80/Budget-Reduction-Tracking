import { PrismaClient } from '@prisma/client';
import {
  OverallAnalytics,
  AccountAnalytics,
  TrendAnalysis,
  MonthlyTrend,
  MonthOverMonthData,
} from '../types/analytics';
import {
  roundCurrency,
  calculateMean,
  calculatePercentage,
  getMonthKey,
  getMonthLabel,
  getDaysDifference,
  calculateStandardDeviation,
} from '../utils/financial.utils';
import { calculateCurrentTrendProjection } from './projection.service';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

/**
 * Get overall analytics for a user across all accounts
 * @param userId - User ID
 * @returns Overall analytics data
 */
export const getOverallAnalytics = async (userId: string): Promise<OverallAnalytics> => {
  // Get all accounts for the user
  const accounts = await prisma.account.findMany({
    where: { userId },
    include: {
      transactions: true,
      snapshots: {
        orderBy: { snapshotDate: 'asc' },
      },
    },
  });

  if (accounts.length === 0) {
    return {
      totalDebt: 0,
      totalReduction: 0,
      reductionPercentage: 0,
      totalAccounts: 0,
      activeAccounts: 0,
      averageMonthlyReduction: 0,
      totalInterestPaid: 0,
      projectedDebtFreeDate: null,
      monthlyTrend: [],
    };
  }

  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter((a) => a.isActive).length;

  // Calculate total current debt
  const totalDebt = accounts.reduce((sum, account) => {
    return sum + account.currentBalance.toNumber();
  }, 0);

  // Calculate total reduction and interest paid
  let totalPayments = 0;
  let totalCharges = 0;
  let totalInterestPaid = 0;

  for (const account of accounts) {
    for (const transaction of account.transactions) {
      const amount = transaction.amount.toNumber();

      switch (transaction.transactionType) {
        case 'PAYMENT':
          totalPayments += amount;
          break;
        case 'CHARGE':
          totalCharges += amount;
          break;
        case 'INTEREST':
          totalCharges += amount;
          totalInterestPaid += amount;
          break;
        case 'ADJUSTMENT':
          if (amount > 0) {
            totalCharges += amount;
          } else {
            totalPayments += Math.abs(amount);
          }
          break;
      }
    }
  }

  const totalReduction = roundCurrency(totalPayments - totalCharges);

  // Calculate total initial balance from first snapshots
  const totalInitialBalance = accounts.reduce((sum, account) => {
    const firstSnapshot = account.snapshots[0];
    if (firstSnapshot) {
      return sum + firstSnapshot.balance.toNumber();
    }
    return sum + account.currentBalance.toNumber();
  }, 0);

  const reductionPercentage = calculatePercentage(
    totalInitialBalance - totalDebt,
    totalInitialBalance
  );

  // Calculate average monthly reduction
  const oldestDate = accounts.reduce((oldest: Date | null, account) => {
    if (account.snapshots.length > 0) {
      const accountOldest = new Date(account.snapshots[0].snapshotDate);
      return !oldest || accountOldest < oldest ? accountOldest : oldest;
    }
    const createdAt = new Date(account.createdAt);
    return !oldest || createdAt < oldest ? createdAt : oldest;
  }, null);

  const monthsElapsed = oldestDate
    ? Math.max(1, getDaysDifference(oldestDate, new Date()) / 30)
    : 1;

  const averageMonthlyReduction = roundCurrency(totalReduction / monthsElapsed);

  // Calculate projected debt-free date
  let projectedDebtFreeDate: Date | null = null;
  if (averageMonthlyReduction > 0 && totalDebt > 0) {
    const monthsRemaining = Math.ceil(totalDebt / averageMonthlyReduction);
    projectedDebtFreeDate = new Date();
    projectedDebtFreeDate.setMonth(projectedDebtFreeDate.getMonth() + monthsRemaining);
  }

  // Generate monthly trend data
  const monthlyTrend = await calculateMonthlyTrend(userId);

  return {
    totalDebt: roundCurrency(totalDebt),
    totalReduction,
    reductionPercentage: roundCurrency(reductionPercentage),
    totalAccounts,
    activeAccounts,
    averageMonthlyReduction,
    totalInterestPaid: roundCurrency(totalInterestPaid),
    projectedDebtFreeDate,
    monthlyTrend,
  };
};

/**
 * Calculate monthly trend data for a user
 * @param userId - User ID
 * @param months - Number of months to include (default: 12)
 * @returns Array of monthly trend data
 */
const calculateMonthlyTrend = async (
  userId: string,
  months: number = 12
): Promise<MonthlyTrend[]> => {
  // Get all snapshots for user's accounts
  const accounts = await prisma.account.findMany({
    where: { userId },
    select: { id: true },
  });

  const accountIds = accounts.map((a) => a.id);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const snapshots = await prisma.snapshot.findMany({
    where: {
      accountId: { in: accountIds },
      snapshotDate: { gte: startDate, lte: endDate },
    },
    orderBy: { snapshotDate: 'asc' },
  });

  // Group by month
  const monthlyData = new Map<string, { balance: number; count: number }>();

  snapshots.forEach((snapshot) => {
    const monthKey = getMonthKey(new Date(snapshot.snapshotDate));
    const balance = snapshot.balance.toNumber();

    const existing = monthlyData.get(monthKey);
    if (existing) {
      existing.balance += balance;
      existing.count++;
    } else {
      monthlyData.set(monthKey, { balance, count: 1 });
    }
  });

  // Convert to array and calculate reductions
  const sortedMonths = Array.from(monthlyData.keys()).sort();
  const trend: MonthlyTrend[] = [];

  for (let i = 0; i < sortedMonths.length; i++) {
    const monthKey = sortedMonths[i];
    const data = monthlyData.get(monthKey)!;
    const [year, month] = monthKey.split('-').map(Number);
    const date = new Date(year, month - 1, 1);

    const reduction = i > 0
      ? roundCurrency(monthlyData.get(sortedMonths[i - 1])!.balance - data.balance)
      : 0;

    trend.push({
      month: getMonthLabel(date),
      totalBalance: roundCurrency(data.balance),
      reduction,
    });
  }

  return trend;
};

/**
 * Get analytics for a specific account
 * @param accountId - Account ID
 * @param userId - User ID (for ownership verification)
 * @returns Account analytics data
 */
export const getAccountAnalytics = async (
  accountId: string,
  userId: string
): Promise<AccountAnalytics> => {
  // Get account with all related data
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: {
      transactions: {
        orderBy: { transactionDate: 'asc' },
      },
      snapshots: {
        orderBy: { snapshotDate: 'asc' },
      },
    },
  });

  if (!account) {
    throw new AppError('Account not found', 404);
  }

  if (account.userId !== userId) {
    throw new AppError('Unauthorized to access this account', 403);
  }

  const currentBalance = account.currentBalance.toNumber();

  // Get initial balance from first snapshot
  const firstSnapshot = account.snapshots[0];
  const initialBalance = firstSnapshot
    ? firstSnapshot.balance.toNumber()
    : currentBalance;

  // Calculate totals from transactions
  let totalPayments = 0;
  let totalCharges = 0;
  let totalInterest = 0;
  const paymentAmounts: number[] = [];

  account.transactions.forEach((transaction) => {
    const amount = transaction.amount.toNumber();

    switch (transaction.transactionType) {
      case 'PAYMENT':
        totalPayments += amount;
        paymentAmounts.push(amount);
        break;
      case 'CHARGE':
        totalCharges += amount;
        break;
      case 'INTEREST':
        totalCharges += amount;
        totalInterest += amount;
        break;
      case 'ADJUSTMENT':
        if (amount > 0) {
          totalCharges += amount;
        } else {
          totalPayments += Math.abs(amount);
        }
        break;
    }
  });

  const totalReduction = roundCurrency(totalPayments - totalCharges);
  const reductionPercentage = calculatePercentage(
    initialBalance - currentBalance,
    initialBalance
  );

  // Calculate averages
  const averageMonthlyPayment = paymentAmounts.length > 0
    ? roundCurrency(calculateMean(paymentAmounts))
    : 0;

  const accountCreatedDate = firstSnapshot
    ? new Date(firstSnapshot.snapshotDate)
    : new Date(account.createdAt);

  const daysInProgram = getDaysDifference(accountCreatedDate, new Date());
  const monthsInProgram = Math.max(1, daysInProgram / 30);
  const averageMonthlyReduction = roundCurrency(totalReduction / monthsInProgram);

  // Calculate projections
  let projectedPayoffDate: Date | null = null;
  let projectedTotalInterest = 0;

  try {
    const projection = await calculateCurrentTrendProjection(accountId);
    if (!projection.error && projection.months > 0 && projection.months < 600) {
      projectedPayoffDate = new Date();
      projectedPayoffDate.setMonth(projectedPayoffDate.getMonth() + projection.months);
      projectedTotalInterest = projection.totalInterest;
    }
  } catch (error) {
    // Projection failed, leave as null
  }

  return {
    currentBalance: roundCurrency(currentBalance),
    initialBalance: roundCurrency(initialBalance),
    totalReduction,
    reductionPercentage: roundCurrency(reductionPercentage),
    totalPayments: roundCurrency(totalPayments),
    totalCharges: roundCurrency(totalCharges),
    totalInterest: roundCurrency(totalInterest),
    averageMonthlyPayment,
    averageMonthlyReduction,
    daysInProgram,
    projectedPayoffDate,
    projectedTotalInterest: roundCurrency(projectedTotalInterest),
  };
};

/**
 * Get trend analysis for a user
 * @param userId - User ID
 * @param _period - Analysis period ('month' | 'quarter' | 'year') - reserved for future use
 * @returns Trend analysis data
 */
export const getTrendAnalysis = async (
  userId: string,
  _period: 'month' | 'quarter' | 'year' = 'month'
): Promise<TrendAnalysis> => {
  // Get user accounts
  const accounts = await prisma.account.findMany({
    where: { userId },
    include: {
      transactions: {
        where: {
          transactionType: 'PAYMENT',
        },
        orderBy: { transactionDate: 'desc' },
      },
      snapshots: {
        orderBy: { snapshotDate: 'desc' },
        take: 13, // Get up to 13 months of snapshots for comparison
      },
    },
  });

  // Calculate payment consistency
  const allPayments: number[] = [];
  accounts.forEach((account) => {
    account.transactions.forEach((transaction) => {
      allPayments.push(transaction.amount.toNumber());
    });
  });

  let paymentConsistency = 0;
  if (allPayments.length > 1) {
    const meanPayment = calculateMean(allPayments);
    const stdDev = calculateStandardDeviation(allPayments);

    // Consistency score: 1 - (coefficient of variation)
    // CV = stdDev / mean, clamped between 0 and 1
    const cv = meanPayment > 0 ? Math.min(1, stdDev / meanPayment) : 1;
    paymentConsistency = roundCurrency((1 - cv) * 100) / 100; // Convert to 0-1 scale
  }

  // Calculate reduction rate
  const currentTotalDebt = accounts.reduce(
    (sum, account) => sum + account.currentBalance.toNumber(),
    0
  );

  const initialTotalDebt = accounts.reduce((sum, account) => {
    const firstSnapshot = account.snapshots[account.snapshots.length - 1];
    return sum + (firstSnapshot ? firstSnapshot.balance.toNumber() : account.currentBalance.toNumber());
  }, 0);

  const totalReduction = initialTotalDebt - currentTotalDebt;
  const oldestDate = accounts.reduce((oldest: Date | null, account) => {
    if (account.snapshots.length > 0) {
      const accountOldest = new Date(account.snapshots[account.snapshots.length - 1].snapshotDate);
      return !oldest || accountOldest < oldest ? accountOldest : oldest;
    }
    return oldest;
  }, null);

  const monthsElapsed = oldestDate
    ? Math.max(1, getDaysDifference(oldestDate, new Date()) / 30)
    : 1;

  const reductionRate = roundCurrency(totalReduction / monthsElapsed);

  // Calculate month-over-month comparison
  const monthOverMonthComparison: MonthOverMonthData[] = [];

  // Group snapshots by month across all accounts
  const monthlyBalances = new Map<string, number>();

  accounts.forEach((account) => {
    account.snapshots.forEach((snapshot) => {
      const monthKey = getMonthKey(new Date(snapshot.snapshotDate));
      const existing = monthlyBalances.get(monthKey) || 0;
      monthlyBalances.set(monthKey, existing + snapshot.balance.toNumber());
    });
  });

  const sortedMonths = Array.from(monthlyBalances.keys()).sort();

  for (let i = 0; i < sortedMonths.length; i++) {
    const monthKey = sortedMonths[i];
    const balance = monthlyBalances.get(monthKey)!;
    const [year, month] = monthKey.split('-').map(Number);
    const date = new Date(year, month - 1, 1);

    let change = 0;
    let changePercentage = 0;

    if (i > 0) {
      const previousBalance = monthlyBalances.get(sortedMonths[i - 1])!;
      change = roundCurrency(previousBalance - balance); // Positive = reduction
      changePercentage = calculatePercentage(change, previousBalance);
    }

    monthOverMonthComparison.push({
      period: getMonthLabel(date),
      balance: roundCurrency(balance),
      change,
      changePercentage: roundCurrency(changePercentage),
    });
  }

  return {
    paymentConsistency: roundCurrency(paymentConsistency * 100) / 100,
    reductionRate,
    monthOverMonthComparison,
  };
};
