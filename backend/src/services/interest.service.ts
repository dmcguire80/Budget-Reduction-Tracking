import { PrismaClient } from '@prisma/client';
import { roundCurrency, getMonthKey, getMonthLabel } from '../utils/financial.utils';
import { InterestHistoryEntry } from '../types/analytics';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

/**
 * Calculate daily interest amount
 * @param balance - Current balance
 * @param annualRate - Annual interest rate as percentage (e.g., 18.5 for 18.5%)
 * @returns Daily interest amount
 */
export const calculateDailyInterest = (balance: number, annualRate: number): number => {
  if (balance <= 0 || annualRate <= 0) return 0;

  const dailyRate = annualRate / 365 / 100;
  return roundCurrency(balance * dailyRate);
};

/**
 * Calculate monthly interest amount
 * @param balance - Current balance
 * @param annualRate - Annual interest rate as percentage (e.g., 18.5 for 18.5%)
 * @returns Monthly interest amount
 */
export const calculateMonthlyInterest = (balance: number, annualRate: number): number => {
  if (balance <= 0 || annualRate <= 0) return 0;

  const monthlyRate = annualRate / 12 / 100;
  return roundCurrency(balance * monthlyRate);
};

/**
 * Calculate compound interest over a period
 * @param principal - Starting principal amount
 * @param rate - Annual interest rate as percentage
 * @param months - Number of months
 * @returns Total compound interest accumulated
 */
export const calculateCompoundInterest = (
  principal: number,
  rate: number,
  months: number
): number => {
  if (principal <= 0 || rate <= 0 || months <= 0) return 0;

  const monthlyRate = rate / 12 / 100;
  const finalAmount = principal * Math.pow(1 + monthlyRate, months);
  const interest = finalAmount - principal;

  return roundCurrency(interest);
};

/**
 * Calculate interest history for an account over a date range
 * Uses transaction history and snapshots to reconstruct historical interest charges
 * @param accountId - Account ID
 * @param startDate - Start date for history
 * @param endDate - End date for history
 * @returns Array of monthly interest history entries
 */
export const calculateInterestHistory = async (
  accountId: string,
  startDate: Date,
  endDate: Date
): Promise<InterestHistoryEntry[]> => {
  // Get account with interest rate
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new AppError('Account not found', 404);
  }

  // Get all interest transactions in the date range
  const interestTransactions = await prisma.transaction.findMany({
    where: {
      accountId,
      transactionType: 'INTEREST',
      transactionDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      transactionDate: 'asc',
    },
  });

  // Get snapshots in the date range to know balances
  const snapshots = await prisma.snapshot.findMany({
    where: {
      accountId,
      snapshotDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      snapshotDate: 'asc',
    },
  });

  // Group interest transactions by month
  const monthlyInterest = new Map<string, { amount: number; balance: number }>();

  // Process interest transactions
  interestTransactions.forEach((transaction) => {
    const monthKey = getMonthKey(new Date(transaction.transactionDate));
    const existing = monthlyInterest.get(monthKey);

    if (existing) {
      existing.amount += transaction.amount.toNumber();
    } else {
      monthlyInterest.set(monthKey, {
        amount: transaction.amount.toNumber(),
        balance: 0,
      });
    }
  });

  // Add balance information from snapshots
  snapshots.forEach((snapshot) => {
    const monthKey = getMonthKey(new Date(snapshot.snapshotDate));
    const existing = monthlyInterest.get(monthKey);

    if (existing) {
      existing.balance = snapshot.balance.toNumber();
    } else {
      monthlyInterest.set(monthKey, {
        amount: 0,
        balance: snapshot.balance.toNumber(),
      });
    }
  });

  // Convert to array and format
  const history: InterestHistoryEntry[] = [];
  const sortedMonths = Array.from(monthlyInterest.keys()).sort();

  for (const monthKey of sortedMonths) {
    const data = monthlyInterest.get(monthKey)!;
    const [year, month] = monthKey.split('-').map(Number);
    const date = new Date(year, month - 1, 1);

    history.push({
      month: getMonthLabel(date),
      interestAmount: roundCurrency(data.amount),
      balance: roundCurrency(data.balance),
    });
  }

  return history;
};

/**
 * Calculate total interest paid on an account
 * @param accountId - Account ID
 * @returns Total interest paid
 */
export const calculateTotalInterestPaid = async (accountId: string): Promise<number> => {
  const interestTransactions = await prisma.transaction.findMany({
    where: {
      accountId,
      transactionType: 'INTEREST',
    },
  });

  const totalInterest = interestTransactions.reduce(
    (sum, transaction) => sum + transaction.amount.toNumber(),
    0
  );

  return roundCurrency(totalInterest);
};

/**
 * Estimate interest to be charged next month based on current balance
 * @param accountId - Account ID
 * @returns Estimated next month's interest
 */
export const estimateNextMonthInterest = async (accountId: string): Promise<number> => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new AppError('Account not found', 404);
  }

  const currentBalance = account.currentBalance.toNumber();
  const interestRate = account.interestRate.toNumber();

  return calculateMonthlyInterest(currentBalance, interestRate);
};

/**
 * Calculate average monthly interest over a period
 * @param accountId - Account ID
 * @param months - Number of months to look back (default: 12)
 * @returns Average monthly interest
 */
export const calculateAverageMonthlyInterest = async (
  accountId: string,
  months: number = 12
): Promise<number> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const interestTransactions = await prisma.transaction.findMany({
    where: {
      accountId,
      transactionType: 'INTEREST',
      transactionDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  if (interestTransactions.length === 0) return 0;

  const totalInterest = interestTransactions.reduce(
    (sum, transaction) => sum + transaction.amount.toNumber(),
    0
  );

  // Calculate actual months covered
  const uniqueMonths = new Set(
    interestTransactions.map((t) => getMonthKey(new Date(t.transactionDate)))
  );

  const monthsCovered = uniqueMonths.size || 1;
  return roundCurrency(totalInterest / monthsCovered);
};
