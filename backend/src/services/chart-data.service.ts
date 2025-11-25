import { PrismaClient } from '@prisma/client';
import { ChartData } from '../types/analytics';
import { getMonthKey, getMonthLabel, roundCurrency } from '../utils/financial.utils';
import { calculatePayoffScenarios } from './projection.service';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

/**
 * Format balance reduction data for line chart
 * @param accountId - Account ID
 * @param dateRange - Optional date range (defaults to all time)
 * @returns Chart data formatted for Chart.js
 */
export const formatBalanceReductionData = async (
  accountId: string,
  dateRange?: { startDate: Date; endDate: Date }
): Promise<ChartData> => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new AppError('Account not found', 404);
  }

  // Build where clause for snapshots
  const where: any = { accountId };
  if (dateRange) {
    where.snapshotDate = {
      gte: dateRange.startDate,
      lte: dateRange.endDate,
    };
  }

  const snapshots = await prisma.snapshot.findMany({
    where,
    orderBy: { snapshotDate: 'asc' },
  });

  if (snapshots.length === 0) {
    return {
      labels: [],
      datasets: [],
    };
  }

  const initialBalance = snapshots[0].balance.toNumber();

  // Format data
  const labels = snapshots.map((snapshot) =>
    getMonthLabel(new Date(snapshot.snapshotDate))
  );

  // Calculate reduction amounts (inverted so reduction = positive)
  const reductionData = snapshots.map((snapshot) => {
    const balance = snapshot.balance.toNumber();
    return roundCurrency(initialBalance - balance);
  });

  // Also include actual balance data
  const balanceData = snapshots.map((snapshot) =>
    roundCurrency(snapshot.balance.toNumber())
  );

  return {
    labels,
    datasets: [
      {
        label: 'Debt Reduction',
        data: reductionData,
        backgroundColor: 'rgba(16, 185, 129, 0.2)', // Green
        borderColor: 'rgba(16, 185, 129, 1)',
        type: 'line',
      },
      {
        label: 'Current Balance',
        data: balanceData,
        backgroundColor: 'rgba(59, 130, 246, 0.2)', // Blue
        borderColor: 'rgba(59, 130, 246, 1)',
        type: 'line',
      },
    ],
  };
};

/**
 * Format interest accumulation data for chart
 * @param accountId - Account ID
 * @param months - Number of months to look back
 * @returns Chart data with interest paid and cumulative interest
 */
export const formatInterestAccumulationData = async (
  accountId: string,
  months: number = 12
): Promise<ChartData> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  // Get interest transactions
  const interestTransactions = await prisma.transaction.findMany({
    where: {
      accountId,
      transactionType: 'INTEREST',
      transactionDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { transactionDate: 'asc' },
  });

  // Group by month
  const monthlyInterest = new Map<string, number>();

  interestTransactions.forEach((transaction) => {
    const monthKey = getMonthKey(new Date(transaction.transactionDate));
    const amount = transaction.amount.toNumber();
    const existing = monthlyInterest.get(monthKey) || 0;
    monthlyInterest.set(monthKey, existing + amount);
  });

  // Sort months
  const sortedMonths = Array.from(monthlyInterest.keys()).sort();

  if (sortedMonths.length === 0) {
    return {
      labels: [],
      datasets: [],
    };
  }

  // Format data
  const labels = sortedMonths.map((monthKey) => {
    const [year, month] = monthKey.split('-').map(Number);
    return getMonthLabel(new Date(year, month - 1, 1));
  });

  const interestData = sortedMonths.map((monthKey) =>
    roundCurrency(monthlyInterest.get(monthKey) || 0)
  );

  // Calculate cumulative interest
  const cumulativeData: number[] = [];
  let cumulative = 0;
  interestData.forEach((amount) => {
    cumulative += amount;
    cumulativeData.push(roundCurrency(cumulative));
  });

  return {
    labels,
    datasets: [
      {
        label: 'Interest Paid',
        data: interestData,
        backgroundColor: 'rgba(239, 68, 68, 0.6)', // Red
        borderColor: 'rgba(239, 68, 68, 1)',
        type: 'bar',
      },
      {
        label: 'Cumulative Interest',
        data: cumulativeData,
        backgroundColor: 'rgba(245, 158, 11, 0.2)', // Orange
        borderColor: 'rgba(245, 158, 11, 1)',
        type: 'line',
      },
    ],
  };
};

/**
 * Format payment distribution data for pie chart
 * @param accountId - Account ID
 * @returns Chart data showing principal vs interest vs fees
 */
export const formatPaymentDistributionData = async (
  accountId: string
): Promise<ChartData> => {
  const transactions = await prisma.transaction.findMany({
    where: { accountId },
  });

  let totalPrincipal = 0;
  let totalInterest = 0;
  let totalFees = 0; // For adjustments that increase balance

  transactions.forEach((transaction) => {
    const amount = transaction.amount.toNumber();

    switch (transaction.transactionType) {
      case 'PAYMENT':
        totalPrincipal += amount;
        break;
      case 'INTEREST':
        totalInterest += amount;
        break;
      case 'CHARGE':
        // Charges are typically fees or purchases
        totalFees += amount;
        break;
      case 'ADJUSTMENT':
        if (amount > 0) {
          totalFees += amount;
        } else {
          totalPrincipal += Math.abs(amount);
        }
        break;
    }
  });

  // Subtract interest from principal (since payments go to both)
  const principalPortion = totalPrincipal - totalInterest;

  return {
    labels: ['Principal Paid', 'Interest Paid', 'Fees/Charges'],
    datasets: [
      {
        label: 'Payment Distribution',
        data: [
          roundCurrency(Math.max(0, principalPortion)),
          roundCurrency(totalInterest),
          roundCurrency(totalFees),
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)', // Green - Principal
          'rgba(239, 68, 68, 0.8)', // Red - Interest
          'rgba(245, 158, 11, 0.8)', // Orange - Fees
        ],
      },
    ],
  };
};

/**
 * Format projection comparison data for chart
 * Compares multiple payment scenarios
 * @param accountId - Account ID
 * @returns Chart data comparing different payoff scenarios
 */
export const formatProjectionComparisonData = async (
  accountId: string
): Promise<ChartData> => {
  const scenarios = await calculatePayoffScenarios(accountId);

  if (scenarios.length === 0) {
    return {
      labels: [],
      datasets: [],
    };
  }

  // Find the longest scenario to determine label count
  const maxMonths = Math.max(...scenarios.map((s) => s.months));

  // Limit to reasonable display (60 months = 5 years)
  const displayMonths = Math.min(maxMonths, 60);

  // Generate month labels
  const labels: string[] = [];
  for (let i = 0; i <= displayMonths; i++) {
    labels.push(`Month ${i}`);
  }

  // Colors for different scenarios
  const colors = [
    { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 1)' }, // Red
    { bg: 'rgba(245, 158, 11, 0.2)', border: 'rgba(245, 158, 11, 1)' }, // Orange
    { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 1)' }, // Blue
    { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 1)' }, // Green
    { bg: 'rgba(139, 92, 246, 0.2)', border: 'rgba(139, 92, 246, 1)' }, // Purple
  ];

  // For each scenario, we need to calculate the balance at each month
  // We'll use the calculatePayoffProjection logic
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new AppError('Account not found', 404);
  }

  const currentBalance = account.currentBalance.toNumber();
  const interestRate = account.interestRate.toNumber();
  const monthlyRate = interestRate / 12 / 100;

  const datasets = scenarios.slice(0, 5).map((scenario, index) => {
    const balances: number[] = [currentBalance];
    let balance = currentBalance;

    for (let month = 1; month <= displayMonths; month++) {
      if (balance <= 0) {
        balances.push(0);
        continue;
      }

      const interestCharged = balance * monthlyRate;
      balance = balance + interestCharged - scenario.monthlyPayment;

      if (balance < 0.01) {
        balance = 0;
      }

      balances.push(roundCurrency(balance));
    }

    const color = colors[index % colors.length];

    return {
      label: scenario.name,
      data: balances,
      backgroundColor: color.bg,
      borderColor: color.border,
      type: 'line' as const,
    };
  });

  return {
    labels,
    datasets,
  };
};

/**
 * Format balance history for multiple accounts on one chart
 * @param userId - User ID
 * @param dateRange - Optional date range
 * @returns Chart data with one dataset per account
 */
export const formatMultiAccountBalanceData = async (
  userId: string,
  dateRange?: { startDate: Date; endDate: Date }
): Promise<ChartData> => {
  const accounts = await prisma.account.findMany({
    where: { userId },
    include: {
      snapshots: {
        where: dateRange
          ? {
              snapshotDate: {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
              },
            }
          : undefined,
        orderBy: { snapshotDate: 'asc' },
      },
    },
  });

  if (accounts.length === 0) {
    return {
      labels: [],
      datasets: [],
    };
  }

  // Collect all unique month labels across all accounts
  const allMonthKeys = new Set<string>();
  accounts.forEach((account) => {
    account.snapshots.forEach((snapshot) => {
      allMonthKeys.add(getMonthKey(new Date(snapshot.snapshotDate)));
    });
  });

  const sortedMonthKeys = Array.from(allMonthKeys).sort();
  const labels = sortedMonthKeys.map((monthKey) => {
    const [year, month] = monthKey.split('-').map(Number);
    return getMonthLabel(new Date(year, month - 1, 1));
  });

  // Colors for different accounts
  const colors = [
    { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 1)' }, // Blue
    { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 1)' }, // Green
    { bg: 'rgba(245, 158, 11, 0.2)', border: 'rgba(245, 158, 11, 1)' }, // Orange
    { bg: 'rgba(139, 92, 246, 0.2)', border: 'rgba(139, 92, 246, 1)' }, // Purple
    { bg: 'rgba(236, 72, 153, 0.2)', border: 'rgba(236, 72, 153, 1)' }, // Pink
  ];

  // Create dataset for each account
  const datasets = accounts.map((account, index) => {
    // Create a map of month -> balance for this account
    const balanceMap = new Map<string, number>();
    account.snapshots.forEach((snapshot) => {
      const monthKey = getMonthKey(new Date(snapshot.snapshotDate));
      balanceMap.set(monthKey, snapshot.balance.toNumber());
    });

    // Map to data array, using null for months without data
    const data = sortedMonthKeys.map((monthKey) => {
      const balance = balanceMap.get(monthKey);
      return balance !== undefined ? roundCurrency(balance) : null;
    });

    const color = colors[index % colors.length];

    return {
      label: account.name,
      data: data as number[],
      backgroundColor: color.bg,
      borderColor: color.border,
      type: 'line' as const,
    };
  });

  return {
    labels,
    datasets,
  };
};
