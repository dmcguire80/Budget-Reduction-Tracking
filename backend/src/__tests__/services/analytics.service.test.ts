import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { getOverallAnalytics } from '../../services/analytics.service';
import { seedTestUser, seedTestAccount, seedTestTransaction, clearDatabase } from '../helpers/database';
import { prisma } from '../setup';
import { TransactionType } from '@prisma/client';

jest.mock('../../utils/logger', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('AnalyticsService', () => {
  let testUser: any;

  beforeEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
    testUser = await seedTestUser('test@example.com');
  });

  describe('getOverallAnalytics', () => {
    it('should return zero analytics when user has no accounts', async () => {
      const result = await getOverallAnalytics(testUser.id);

      expect(result).toEqual({
        totalDebt: 0,
        totalReduction: 0,
        reductionPercentage: 0,
        totalAccounts: 0,
        activeAccounts: 0,
        averageMonthlyReduction: 0,
        totalInterestPaid: 0,
        projectedDebtFreeDate: null,
        monthlyTrend: [],
      });
    });

    it('should calculate total debt across multiple accounts', async () => {
      await seedTestAccount(testUser.id, { currentBalance: 1000 });
      await seedTestAccount(testUser.id, { currentBalance: 2000 });
      await seedTestAccount(testUser.id, { currentBalance: 1500 });

      const result = await getOverallAnalytics(testUser.id);

      expect(result.totalDebt).toBe(4500);
      expect(result.totalAccounts).toBe(3);
      expect(result.activeAccounts).toBe(3);
    });

    it('should count only active accounts', async () => {
      await seedTestAccount(testUser.id, { currentBalance: 1000 });
      const inactiveAccount = await seedTestAccount(testUser.id, { currentBalance: 2000 });
      await prisma.account.update({
        where: { id: inactiveAccount.id },
        data: { isActive: false },
      });

      const result = await getOverallAnalytics(testUser.id);

      expect(result.totalAccounts).toBe(2);
      expect(result.activeAccounts).toBe(1);
    });

    it('should calculate total payments and charges correctly', async () => {
      const account = await seedTestAccount(testUser.id, { currentBalance: 1000 });

      await seedTestTransaction(account.id, {
        amount: 500,
        transactionType: TransactionType.PAYMENT,
        transactionDate: new Date('2024-01-15'),
      });
      await seedTestTransaction(account.id, {
        amount: 200,
        transactionType: TransactionType.CHARGE,
        transactionDate: new Date('2024-01-20'),
      });
      await seedTestTransaction(account.id, {
        amount: 50,
        transactionType: TransactionType.INTEREST,
        transactionDate: new Date('2024-01-25'),
      });

      const result = await getOverallAnalytics(testUser.id);

      // totalReduction = totalPayments - totalCharges
      // totalPayments = 500
      // totalCharges = 200 + 50 = 250
      // totalReduction = 500 - 250 = 250
      expect(result.totalReduction).toBe(250);
      expect(result.totalInterestPaid).toBe(50);
    });

    it('should handle adjustment transactions correctly', async () => {
      const account = await seedTestAccount(testUser.id);

      await seedTestTransaction(account.id, {
        amount: 100,
        transactionType: TransactionType.ADJUSTMENT,
        transactionDate: new Date(),
      });
      await seedTestTransaction(account.id, {
        amount: -50,
        transactionType: TransactionType.ADJUSTMENT,
        transactionDate: new Date(),
      });

      const result = await getOverallAnalytics(testUser.id);

      // Positive adjustment adds to charges (100)
      // Negative adjustment adds to payments (50)
      // totalReduction = 50 - 100 = -50
      expect(result.totalReduction).toBe(-50);
    });

    it('should calculate reduction percentage correctly', async () => {
      const account = await seedTestAccount(testUser.id, { currentBalance: 600 });

      // Create initial snapshot with starting balance
      await prisma.snapshot.deleteMany({ where: { accountId: account.id } });
      await prisma.snapshot.create({
        data: {
          accountId: account.id,
          balance: 1000,
          snapshotDate: new Date('2024-01-01'),
          note: 'Starting balance',
        },
      });

      const result = await getOverallAnalytics(testUser.id);

      // Reduction from 1000 to 600 = 400
      // Percentage = (400 / 1000) * 100 = 40%
      expect(result.reductionPercentage).toBeCloseTo(40, 0);
    });

    it('should handle multiple accounts with transactions', async () => {
      const account1 = await seedTestAccount(testUser.id, { currentBalance: 1000 });
      const account2 = await seedTestAccount(testUser.id, { currentBalance: 2000 });

      await seedTestTransaction(account1.id, {
        amount: 200,
        transactionType: TransactionType.PAYMENT,
      });
      await seedTestTransaction(account2.id, {
        amount: 300,
        transactionType: TransactionType.PAYMENT,
      });
      await seedTestTransaction(account1.id, {
        amount: 50,
        transactionType: TransactionType.INTEREST,
      });

      const result = await getOverallAnalytics(testUser.id);

      expect(result.totalDebt).toBe(3000);
      expect(result.totalReduction).toBe(450); // (200 + 300) - 50
      expect(result.totalInterestPaid).toBe(50);
    });

    it('should only include analytics for specified user', async () => {
      const otherUser = await seedTestUser('other@example.com');
      const otherAccount = await seedTestAccount(otherUser.id, { currentBalance: 5000 });

      await seedTestAccount(testUser.id, { currentBalance: 1000 });
      await seedTestTransaction(otherAccount.id, {
        amount: 1000,
        transactionType: TransactionType.PAYMENT,
      });

      const result = await getOverallAnalytics(testUser.id);

      expect(result.totalDebt).toBe(1000);
      expect(result.totalReduction).toBe(0);
      expect(result.totalAccounts).toBe(1);
    });
  });
});
