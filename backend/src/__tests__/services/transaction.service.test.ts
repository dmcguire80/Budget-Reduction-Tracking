import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  getAccountTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAllTransactions,
} from '../../services/transaction.service';
import { seedTestUser, seedTestAccount, seedTestTransaction, clearDatabase } from '../helpers/database';
import { prisma } from '../setup';
import { AppError } from '../../middleware/errorHandler';
import { TransactionType } from '@prisma/client';

jest.mock('../../utils/logger', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('TransactionService', () => {
  let testUser: any;
  let testAccount: any;

  beforeEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
    testUser = await seedTestUser('test@example.com');
    testAccount = await seedTestAccount(testUser.id, { currentBalance: 1000 });
  });

  describe('getAccountTransactions', () => {
    it('should return all transactions for an account', async () => {
      await seedTestTransaction(testAccount.id, { amount: 100 });
      await seedTestTransaction(testAccount.id, { amount: 200 });
      await seedTestTransaction(testAccount.id, { amount: 300 });

      const result = await getAccountTransactions(testAccount.id, testUser.id);

      expect(result.transactions).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should return empty array when account has no transactions', async () => {
      const result = await getAccountTransactions(testAccount.id, testUser.id);

      expect(result.transactions).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should filter transactions by type', async () => {
      await seedTestTransaction(testAccount.id, { transactionType: TransactionType.PAYMENT });
      await seedTestTransaction(testAccount.id, { transactionType: TransactionType.CHARGE });
      await seedTestTransaction(testAccount.id, { transactionType: TransactionType.PAYMENT });

      const result = await getAccountTransactions(testAccount.id, testUser.id, {
        transactionType: TransactionType.PAYMENT,
      });

      expect(result.transactions).toHaveLength(2);
      result.transactions.forEach((tx) => {
        expect(tx.transactionType).toBe(TransactionType.PAYMENT);
      });
    });

    it('should filter transactions by date range', async () => {
      await seedTestTransaction(testAccount.id, {
        transactionDate: new Date('2024-01-01'),
      });
      await seedTestTransaction(testAccount.id, {
        transactionDate: new Date('2024-02-01'),
      });
      await seedTestTransaction(testAccount.id, {
        transactionDate: new Date('2024-03-01'),
      });

      const result = await getAccountTransactions(testAccount.id, testUser.id, {
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
      });

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].transactionDate).toEqual(new Date('2024-02-01'));
    });

    it('should paginate results', async () => {
      for (let i = 0; i < 10; i++) {
        await seedTestTransaction(testAccount.id);
      }

      const result = await getAccountTransactions(testAccount.id, testUser.id, {
        limit: 5,
        offset: 3,
      });

      expect(result.transactions).toHaveLength(5);
      expect(result.total).toBe(10);
    });

    it('should throw AppError when user unauthorized', async () => {
      const otherUser = await seedTestUser('other@example.com');

      await expect(getAccountTransactions(testAccount.id, otherUser.id)).rejects.toThrow(AppError);
    });
  });

  describe('createTransaction', () => {
    it('should create a payment transaction and update balance', async () => {
      const transactionData = {
        amount: 200,
        transactionType: TransactionType.PAYMENT,
        transactionDate: new Date(),
        description: 'Payment made',
      };

      const result = await createTransaction(testAccount.id, testUser.id, transactionData);

      expect(result).toMatchObject({
        amount: expect.any(Object),
        transactionType: TransactionType.PAYMENT,
        description: 'Payment made',
      });

      // Check balance updated correctly (1000 - 200 = 800)
      const updatedAccount = await prisma.account.findUnique({
        where: { id: testAccount.id },
      });
      expect(updatedAccount?.currentBalance.toNumber()).toBe(800);
    });

    it('should create a charge transaction and update balance', async () => {
      const transactionData = {
        amount: 150,
        transactionType: TransactionType.CHARGE,
        transactionDate: new Date(),
        description: 'Purchase made',
      };

      await createTransaction(testAccount.id, testUser.id, transactionData);

      // Check balance updated correctly (1000 + 150 = 1150)
      const updatedAccount = await prisma.account.findUnique({
        where: { id: testAccount.id },
      });
      expect(updatedAccount?.currentBalance.toNumber()).toBe(1150);
    });

    it('should create an interest transaction and update balance', async () => {
      const transactionData = {
        amount: 50,
        transactionType: TransactionType.INTEREST,
        transactionDate: new Date(),
        description: 'Interest charged',
      };

      await createTransaction(testAccount.id, testUser.id, transactionData);

      // Check balance updated correctly (1000 + 50 = 1050)
      const updatedAccount = await prisma.account.findUnique({
        where: { id: testAccount.id },
      });
      expect(updatedAccount?.currentBalance.toNumber()).toBe(1050);
    });

    it('should create an adjustment transaction and update balance', async () => {
      const transactionData = {
        amount: -75,
        transactionType: TransactionType.ADJUSTMENT,
        transactionDate: new Date(),
        description: 'Balance adjustment',
      };

      await createTransaction(testAccount.id, testUser.id, transactionData);

      // Check balance updated correctly (1000 + (-75) = 925)
      const updatedAccount = await prisma.account.findUnique({
        where: { id: testAccount.id },
      });
      expect(updatedAccount?.currentBalance.toNumber()).toBe(925);
    });

    it('should create automatic snapshot after transaction', async () => {
      // Clear initial snapshot
      await prisma.snapshot.deleteMany({ where: { accountId: testAccount.id } });

      const transactionData = {
        amount: 200,
        transactionType: TransactionType.PAYMENT,
        transactionDate: new Date(),
        description: 'Payment made',
      };

      await createTransaction(testAccount.id, testUser.id, transactionData);

      const snapshots = await prisma.snapshot.findMany({
        where: { accountId: testAccount.id },
      });

      expect(snapshots).toHaveLength(1);
      expect(snapshots[0].balance.toNumber()).toBe(800);
      expect(snapshots[0].note).toContain('Auto-snapshot after PAYMENT');
    });

    it('should throw AppError when account not found', async () => {
      const transactionData = {
        amount: 100,
        transactionType: TransactionType.PAYMENT,
        transactionDate: new Date(),
      };

      await expect(
        createTransaction('nonexistent-id', testUser.id, transactionData)
      ).rejects.toThrow(AppError);
    });

    it('should throw AppError when user unauthorized', async () => {
      const otherUser = await seedTestUser('other@example.com');
      const transactionData = {
        amount: 100,
        transactionType: TransactionType.PAYMENT,
        transactionDate: new Date(),
      };

      await expect(
        createTransaction(testAccount.id, otherUser.id, transactionData)
      ).rejects.toThrow(AppError);
    });
  });

  describe('updateTransaction', () => {
    it('should update transaction and recalculate balance', async () => {
      // Create initial transaction (1000 - 100 = 900)
      const transaction = await seedTestTransaction(testAccount.id, {
        amount: 100,
        transactionType: TransactionType.PAYMENT,
      });

      // Update balance to account for the transaction
      await prisma.account.update({
        where: { id: testAccount.id },
        data: { currentBalance: 900 },
      });

      // Update transaction amount to 200
      const updateData = {
        amount: 200,
      };

      await updateTransaction(transaction.id, testUser.id, updateData);

      // Check balance recalculated correctly (1000 - 200 = 800)
      const updatedAccount = await prisma.account.findUnique({
        where: { id: testAccount.id },
      });
      expect(updatedAccount?.currentBalance.toNumber()).toBe(800);
    });

    it('should update transaction type and recalculate balance', async () => {
      // Create initial payment (1000 - 100 = 900)
      const transaction = await seedTestTransaction(testAccount.id, {
        amount: 100,
        transactionType: TransactionType.PAYMENT,
      });

      await prisma.account.update({
        where: { id: testAccount.id },
        data: { currentBalance: 900 },
      });

      // Change to charge (1000 + 100 = 1100)
      const updateData = {
        transactionType: TransactionType.CHARGE,
      };

      await updateTransaction(transaction.id, testUser.id, updateData);

      const updatedAccount = await prisma.account.findUnique({
        where: { id: testAccount.id },
      });
      expect(updatedAccount?.currentBalance.toNumber()).toBe(1100);
    });

    it('should create snapshot after update', async () => {
      const transaction = await seedTestTransaction(testAccount.id);

      // Clear snapshots
      await prisma.snapshot.deleteMany({ where: { accountId: testAccount.id } });

      await updateTransaction(transaction.id, testUser.id, {
        amount: 150,
      });

      const snapshots = await prisma.snapshot.findMany({
        where: { accountId: testAccount.id },
      });

      expect(snapshots).toHaveLength(1);
      expect(snapshots[0].note).toContain('Balance recalculated after transaction update');
    });

    it('should throw AppError when transaction not found', async () => {
      await expect(
        updateTransaction('nonexistent-id', testUser.id, { amount: 150 })
      ).rejects.toThrow(AppError);
    });

    it('should throw AppError when user unauthorized', async () => {
      const transaction = await seedTestTransaction(testAccount.id);
      const otherUser = await seedTestUser('other@example.com');

      await expect(
        updateTransaction(transaction.id, otherUser.id, { amount: 150 })
      ).rejects.toThrow(AppError);
    });
  });

  describe('deleteTransaction', () => {
    it('should delete transaction and reverse balance change', async () => {
      // Create payment transaction (1000 - 100 = 900)
      const transaction = await seedTestTransaction(testAccount.id, {
        amount: 100,
        transactionType: TransactionType.PAYMENT,
      });

      await prisma.account.update({
        where: { id: testAccount.id },
        data: { currentBalance: 900 },
      });

      // Delete transaction (should restore to 1000)
      await deleteTransaction(transaction.id, testUser.id);

      const updatedAccount = await prisma.account.findUnique({
        where: { id: testAccount.id },
      });
      expect(updatedAccount?.currentBalance.toNumber()).toBe(1000);

      // Verify transaction deleted
      const deletedTransaction = await prisma.transaction.findUnique({
        where: { id: transaction.id },
      });
      expect(deletedTransaction).toBeNull();
    });

    it('should reverse charge transaction on delete', async () => {
      // Create charge transaction (1000 + 150 = 1150)
      const transaction = await seedTestTransaction(testAccount.id, {
        amount: 150,
        transactionType: TransactionType.CHARGE,
      });

      await prisma.account.update({
        where: { id: testAccount.id },
        data: { currentBalance: 1150 },
      });

      // Delete transaction (should restore to 1000)
      await deleteTransaction(transaction.id, testUser.id);

      const updatedAccount = await prisma.account.findUnique({
        where: { id: testAccount.id },
      });
      expect(updatedAccount?.currentBalance.toNumber()).toBe(1000);
    });

    it('should create snapshot after deletion', async () => {
      const transaction = await seedTestTransaction(testAccount.id);

      // Clear snapshots
      await prisma.snapshot.deleteMany({ where: { accountId: testAccount.id } });

      await deleteTransaction(transaction.id, testUser.id);

      const snapshots = await prisma.snapshot.findMany({
        where: { accountId: testAccount.id },
      });

      expect(snapshots).toHaveLength(1);
      expect(snapshots[0].note).toContain('Balance recalculated after transaction deletion');
    });

    it('should throw AppError when transaction not found', async () => {
      await expect(deleteTransaction('nonexistent-id', testUser.id)).rejects.toThrow(AppError);
    });

    it('should throw AppError when user unauthorized', async () => {
      const transaction = await seedTestTransaction(testAccount.id);
      const otherUser = await seedTestUser('other@example.com');

      await expect(deleteTransaction(transaction.id, otherUser.id)).rejects.toThrow(AppError);
    });
  });

  describe('getAllTransactions', () => {
    it('should return all transactions across all user accounts', async () => {
      const account2 = await seedTestAccount(testUser.id, { name: 'Account 2' });

      await seedTestTransaction(testAccount.id);
      await seedTestTransaction(testAccount.id);
      await seedTestTransaction(account2.id);

      const result = await getAllTransactions(testUser.id);

      expect(result.transactions).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should only return transactions for the specified user', async () => {
      const otherUser = await seedTestUser('other@example.com');
      const otherAccount = await seedTestAccount(otherUser.id);

      await seedTestTransaction(testAccount.id);
      await seedTestTransaction(otherAccount.id);

      const result = await getAllTransactions(testUser.id);

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].accountId).toBe(testAccount.id);
    });

    it('should include account information in response', async () => {
      await seedTestTransaction(testAccount.id);

      const result = await getAllTransactions(testUser.id);

      expect(result.transactions[0]).toHaveProperty('account');
      expect(result.transactions[0].account).toMatchObject({
        id: testAccount.id,
        name: testAccount.name,
        accountType: testAccount.accountType,
      });
    });

    it('should filter by transaction type', async () => {
      await seedTestTransaction(testAccount.id, { transactionType: TransactionType.PAYMENT });
      await seedTestTransaction(testAccount.id, { transactionType: TransactionType.CHARGE });

      const result = await getAllTransactions(testUser.id, {
        transactionType: TransactionType.PAYMENT,
      });

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].transactionType).toBe(TransactionType.PAYMENT);
    });

    it('should filter by date range', async () => {
      await seedTestTransaction(testAccount.id, {
        transactionDate: new Date('2024-01-01'),
      });
      await seedTestTransaction(testAccount.id, {
        transactionDate: new Date('2024-02-01'),
      });

      const result = await getAllTransactions(testUser.id, {
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
      });

      expect(result.transactions).toHaveLength(1);
    });
  });
});
