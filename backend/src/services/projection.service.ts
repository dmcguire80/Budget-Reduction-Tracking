import { PrismaClient } from '@prisma/client';
import { PayoffProjection, MonthlyBreakdown } from '../types/analytics';
import { roundCurrency, calculateMean } from '../utils/financial.utils';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

/**
 * Calculate payoff projection for a given balance, interest rate, and monthly payment
 * @param currentBalance - Current balance amount
 * @param interestRate - Annual interest rate as percentage (e.g., 18.5)
 * @param monthlyPayment - Monthly payment amount
 * @returns Payoff projection with monthly breakdown
 */
export const calculatePayoffProjection = (
  currentBalance: number,
  interestRate: number,
  monthlyPayment: number
): PayoffProjection => {
  // Validate inputs
  if (currentBalance <= 0) {
    return {
      months: 0,
      totalInterest: 0,
      finalBalance: 0,
      monthlyBreakdown: [],
    };
  }

  if (monthlyPayment <= 0) {
    return {
      months: 0,
      totalInterest: 0,
      finalBalance: currentBalance,
      monthlyBreakdown: [],
      error: 'Monthly payment must be greater than zero',
    };
  }

  const monthlyRate = interestRate / 12 / 100;
  const monthlyInterest = currentBalance * monthlyRate;

  // Check if payment is sufficient to make progress
  if (monthlyPayment <= monthlyInterest) {
    return {
      months: 600, // Max out at 50 years
      totalInterest: 0,
      finalBalance: currentBalance,
      monthlyBreakdown: [],
      error: 'Payment must exceed monthly interest to pay off debt',
    };
  }

  let balance = currentBalance;
  let totalInterest = 0;
  let months = 0;
  const monthlyBreakdown: MonthlyBreakdown[] = [];
  const maxMonths = 600; // 50 years maximum

  while (balance > 0 && months < maxMonths) {
    months++;

    // Calculate interest for this month
    const interestCharged = roundCurrency(balance * monthlyRate);
    totalInterest += interestCharged;

    // Add interest to balance
    balance += interestCharged;

    // Determine actual payment (don't overpay on final month)
    const actualPayment = Math.min(monthlyPayment, balance);
    const principalPaid = roundCurrency(actualPayment - interestCharged);

    // Subtract payment
    balance = roundCurrency(balance - actualPayment);

    // Add to breakdown
    monthlyBreakdown.push({
      month: months,
      balance: balance < 0.01 ? 0 : balance, // Handle floating point errors
      interestCharged,
      paymentAmount: actualPayment,
      principalPaid,
    });

    // Stop if balance is effectively zero
    if (balance < 0.01) {
      balance = 0;
      break;
    }
  }

  return {
    months,
    totalInterest: roundCurrency(totalInterest),
    finalBalance: roundCurrency(balance),
    monthlyBreakdown,
  };
};

/**
 * Calculate payoff projection using account's minimum payment
 * @param accountId - Account ID
 * @returns Payoff projection
 */
export const calculateMinimumPaymentProjection = async (
  accountId: string
): Promise<PayoffProjection> => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new AppError('Account not found', 404);
  }

  const currentBalance = account.currentBalance.toNumber();
  const interestRate = account.interestRate.toNumber();
  const minimumPayment = account.minimumPayment?.toNumber() || 0;

  if (!minimumPayment || minimumPayment <= 0) {
    return {
      months: 0,
      totalInterest: 0,
      finalBalance: currentBalance,
      monthlyBreakdown: [],
      error: 'Account does not have a minimum payment set',
    };
  }

  return calculatePayoffProjection(currentBalance, interestRate, minimumPayment);
};

/**
 * Calculate payoff projection based on actual payment history (current trend)
 * @param accountId - Account ID
 * @param lookbackMonths - Number of months to analyze for average payment (default: 3)
 * @returns Payoff projection
 */
export const calculateCurrentTrendProjection = async (
  accountId: string,
  lookbackMonths: number = 3
): Promise<PayoffProjection> => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new AppError('Account not found', 404);
  }

  // Get recent payment transactions
  const lookbackDate = new Date();
  lookbackDate.setMonth(lookbackDate.getMonth() - lookbackMonths);

  const paymentTransactions = await prisma.transaction.findMany({
    where: {
      accountId,
      transactionType: 'PAYMENT',
      transactionDate: {
        gte: lookbackDate,
      },
    },
    orderBy: {
      transactionDate: 'desc',
    },
  });

  if (paymentTransactions.length === 0) {
    return {
      months: 0,
      totalInterest: 0,
      finalBalance: account.currentBalance.toNumber(),
      monthlyBreakdown: [],
      error: 'No recent payment history available to calculate trend',
    };
  }

  // Calculate average payment
  const paymentAmounts = paymentTransactions.map((t) => t.amount.toNumber());
  const averagePayment = calculateMean(paymentAmounts);

  const currentBalance = account.currentBalance.toNumber();
  const interestRate = account.interestRate.toNumber();

  return calculatePayoffProjection(currentBalance, interestRate, averagePayment);
};

/**
 * Calculate custom payoff projection with a specified monthly payment
 * @param accountId - Account ID
 * @param customPayment - Custom monthly payment amount
 * @returns Payoff projection
 */
export const calculateCustomProjection = async (
  accountId: string,
  customPayment: number
): Promise<PayoffProjection> => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new AppError('Account not found', 404);
  }

  const currentBalance = account.currentBalance.toNumber();
  const interestRate = account.interestRate.toNumber();

  return calculatePayoffProjection(currentBalance, interestRate, customPayment);
};

/**
 * Calculate multiple payoff scenarios for comparison
 * @param accountId - Account ID
 * @returns Array of scenarios (minimum payment, current trend, extra payments)
 */
export const calculatePayoffScenarios = async (accountId: string) => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new AppError('Account not found', 404);
  }

  const currentBalance = account.currentBalance.toNumber();
  const interestRate = account.interestRate.toNumber();
  const minimumPayment = account.minimumPayment?.toNumber() || 0;

  // Get current trend payment
  const lookbackDate = new Date();
  lookbackDate.setMonth(lookbackDate.getMonth() - 3);

  const paymentTransactions = await prisma.transaction.findMany({
    where: {
      accountId,
      transactionType: 'PAYMENT',
      transactionDate: {
        gte: lookbackDate,
      },
    },
  });

  const paymentAmounts = paymentTransactions.map((t) => t.amount.toNumber());
  const currentTrendPayment = paymentAmounts.length > 0 ? calculateMean(paymentAmounts) : 0;

  const scenarios = [];

  // Scenario 1: Minimum payment (if available)
  if (minimumPayment > 0) {
    const projection = calculatePayoffProjection(currentBalance, interestRate, minimumPayment);
    scenarios.push({
      name: 'Minimum Payment',
      monthlyPayment: minimumPayment,
      months: projection.months,
      totalInterest: projection.totalInterest,
      totalPaid: roundCurrency(currentBalance + projection.totalInterest),
      error: projection.error,
    });
  }

  // Scenario 2: Current trend (if available)
  if (currentTrendPayment > 0) {
    const projection = calculatePayoffProjection(currentBalance, interestRate, currentTrendPayment);
    scenarios.push({
      name: 'Current Trend',
      monthlyPayment: roundCurrency(currentTrendPayment),
      months: projection.months,
      totalInterest: projection.totalInterest,
      totalPaid: roundCurrency(currentBalance + projection.totalInterest),
      error: projection.error,
    });
  }

  // Scenario 3: Extra $50/month
  const basePayment = Math.max(minimumPayment, currentTrendPayment, 0);
  if (basePayment > 0) {
    const extra50Payment = basePayment + 50;
    const projection = calculatePayoffProjection(currentBalance, interestRate, extra50Payment);
    scenarios.push({
      name: 'Extra $50/month',
      monthlyPayment: extra50Payment,
      months: projection.months,
      totalInterest: projection.totalInterest,
      totalPaid: roundCurrency(currentBalance + projection.totalInterest),
      error: projection.error,
    });

    // Scenario 4: Extra $100/month
    const extra100Payment = basePayment + 100;
    const projection2 = calculatePayoffProjection(currentBalance, interestRate, extra100Payment);
    scenarios.push({
      name: 'Extra $100/month',
      monthlyPayment: extra100Payment,
      months: projection2.months,
      totalInterest: projection2.totalInterest,
      totalPaid: roundCurrency(currentBalance + projection2.totalInterest),
      error: projection2.error,
    });

    // Scenario 5: Extra $200/month
    const extra200Payment = basePayment + 200;
    const projection3 = calculatePayoffProjection(currentBalance, interestRate, extra200Payment);
    scenarios.push({
      name: 'Extra $200/month',
      monthlyPayment: extra200Payment,
      months: projection3.months,
      totalInterest: projection3.totalInterest,
      totalPaid: roundCurrency(currentBalance + projection3.totalInterest),
      error: projection3.error,
    });
  }

  return scenarios;
};

/**
 * Calculate the monthly payment needed to pay off debt in a target number of months
 * @param accountId - Account ID
 * @param targetMonths - Desired number of months to pay off
 * @returns Required monthly payment
 */
export const calculateRequiredPayment = async (
  accountId: string,
  targetMonths: number
): Promise<number> => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new AppError('Account not found', 404);
  }

  if (targetMonths <= 0) {
    throw new AppError('Target months must be greater than zero', 400);
  }

  const currentBalance = account.currentBalance.toNumber();
  const interestRate = account.interestRate.toNumber();
  const monthlyRate = interestRate / 12 / 100;

  // Use loan payment formula: P = (r * PV) / (1 - (1 + r)^(-n))
  // Where: P = payment, r = monthly rate, PV = present value (balance), n = number of payments
  const payment =
    (monthlyRate * currentBalance) / (1 - Math.pow(1 + monthlyRate, -targetMonths));

  return roundCurrency(payment);
};
