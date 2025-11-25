import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountSummary,
} from '../../services/account.service';
import { seedTestUser, seedTestAccount, seedTestTransaction, clearDatabase } from '../helpers/database';
import { prisma } from '../setup';
import { AppError } from '../../middleware/errorHandler';
import { AccountType, TransactionType } from '@prisma/client';

jest.mock('../../utils/logger', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('AccountService', () => {
  let testUser: any;

  beforeEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
    testUser = await seedTestUser('test@example.com');
  });

  describe('getAllAccounts', () => {
    it('should return all accounts for a user', async () => {
      await seedTestAccount(testUser.id, { name: 'Account 1' });
      await seedTestAccount(testUser.id, { name: 'Account 2' });
      await seedTestAccount(testUser.id, { name: 'Account 3' });

      const result = await getAllAccounts(testUser.id);

      expect(result.accounts).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should return empty array when user has no accounts', async () => {
      const result = await getAllAccounts(testUser.id);

      expect(result.accounts).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should filter accounts by type', async () => {
      await seedTestAccount(testUser.id, { accountType: AccountType.CREDIT_CARD });
      await seedTestAccount(testUser.id, { accountType: AccountType.PERSONAL_LOAN });
      await seedTestAccount(testUser.id, { accountType: AccountType.CREDIT_CARD });

      const result = await getAllAccounts(testUser.id, {
        accountType: AccountType.CREDIT_CARD,
      });

      expect(result.accounts).toHaveLength(2);
      expect(result.total).toBe(2);
      result.accounts.forEach((account) => {
        expect(account.accountType).toBe(AccountType.CREDIT_CARD);
      });
    });

    it('should filter accounts by isActive status', async () => {
      await seedTestAccount(testUser.id, { name: 'Active Account' });
      const inactiveAccount = await seedTestAccount(testUser.id, { name: 'Inactive Account' });
      await prisma.account.update({
        where: { id: inactiveAccount.id },
        data: { isActive: false },
      });

      const result = await getAllAccounts(testUser.id, { isActive: true });

      expect(result.accounts).toHaveLength(1);
      expect(result.accounts[0].name).toBe('Active Account');
    });

    it('should sort accounts by balance descending', async () => {
      await seedTestAccount(testUser.id, { name: 'Low', currentBalance: 100 });
      await seedTestAccount(testUser.id, { name: 'High', currentBalance: 1000 });
      await seedTestAccount(testUser.id, { name: 'Medium', currentBalance: 500 });

      const result = await getAllAccounts(testUser.id, {
        sortBy: 'balance',
        sortOrder: 'desc',
      });

      expect(result.accounts[0].name).toBe('High');
      expect(result.accounts[1].name).toBe('Medium');
      expect(result.accounts[2].name).toBe('Low');
    });

    it('should only return accounts for the specified user', async () => {
      const otherUser = await seedTestUser('other@example.com');
      await seedTestAccount(testUser.id, { name: 'My Account' });
      await seedTestAccount(otherUser.id, { name: 'Other Account' });

      const result = await getAllAccounts(testUser.id);

      expect(result.accounts).toHaveLength(1);
      expect(result.accounts[0].name).toBe('My Account');
    });
  });

  describe('getAccountById', () => {
    it('should return account when found and authorized', async () => {
      const account = await seedTestAccount(testUser.id, { name: 'Test Account' });

      const result = await getAccountById(account.id, testUser.id);

      expect(result.id).toBe(account.id);
      expect(result.name).toBe('Test Account');
    });

    it('should throw AppError when account not found', async () => {
      await expect(getAccountById('nonexistent-id', testUser.id)).rejects.toThrow(AppError);

      await expect(getAccountById('nonexistent-id', testUser.id)).rejects.toThrow(
        'Account not found'
      );
    });

    it('should throw AppError when user unauthorized', async () => {
      const otherUser = await seedTestUser('other@example.com');
      const account = await seedTestAccount(otherUser.id, { name: 'Other Account' });

      await expect(getAccountById(account.id, testUser.id)).rejects.toThrow(AppError);

      await expect(getAccountById(account.id, testUser.id)).rejects.toThrow(
        'Unauthorized to access this account'
      );
    });
  });

  describe('createAccount', () => {
    it('should create a new account', async () => {
      const accountData = {
        name: 'Test Credit Card',
        accountType: AccountType.CREDIT_CARD,
        currentBalance: 1500,
        creditLimit: 5000,
        interestRate: 18.99,
        minimumPayment: 50,
        dueDay: 15,
      };

      const result = await createAccount(testUser.id, accountData);

      expect(result).toMatchObject(accountData);
      expect(result.userId).toBe(testUser.id);
      expect(result.isActive).toBe(true);
    });

    it('should create initial snapshot when account is created', async () => {
      const accountData = {
        name: 'Test Credit Card',
        accountType: AccountType.CREDIT_CARD,
        currentBalance: 1500,
        creditLimit: 5000,
        interestRate: 18.99,
        minimumPayment: 50,
        dueDay: 15,
      };

      const account = await createAccount(testUser.id, accountData);

      const snapshots = await prisma.snapshot.findMany({
        where: { accountId: account.id },
      });

      expect(snapshots).toHaveLength(1);
      expect(snapshots[0].balance.toNumber()).toBe(1500);
      expect(snapshots[0].note).toBe('Initial balance snapshot');
    });

    it('should create account without optional fields', async () => {
      const accountData = {
        name: 'Simple Account',
        accountType: AccountType.OTHER,
        currentBalance: 1000,
        interestRate: 0,
      };

      const result = await createAccount(testUser.id, accountData);

      expect(result.name).toBe('Simple Account');
      expect(result.creditLimit).toBeNull();
      expect(result.minimumPayment).toBeNull();
      expect(result.dueDay).toBeNull();
    });
  });

  describe('updateAccount', () => {
    it('should update account details', async () => {
      const account = await seedTestAccount(testUser.id, { name: 'Old Name' });

      const result = await updateAccount(account.id, testUser.id, {
        name: 'New Name',
        interestRate: 20.5,
      });

      expect(result.name).toBe('New Name');
      expect(result.interestRate.toNumber()).toBe(20.5);
    });

    it('should create snapshot when balance changes', async () => {
      const account = await seedTestAccount(testUser.id, { currentBalance: 1000 });

      // Clear initial snapshot
      await prisma.snapshot.deleteMany({ where: { accountId: account.id } });

      await updateAccount(account.id, testUser.id, {
        currentBalance: 800,
      });

      const snapshots = await prisma.snapshot.findMany({
        where: { accountId: account.id },
      });

      expect(snapshots).toHaveLength(1);
      expect(snapshots[0].balance.toNumber()).toBe(800);
      expect(snapshots[0].note).toBe('Balance updated manually');
    });

    it('should not create snapshot when balance does not change', async () => {
      const account = await seedTestAccount(testUser.id, { currentBalance: 1000 });

      // Clear initial snapshot
      await prisma.snapshot.deleteMany({ where: { accountId: account.id } });

      await updateAccount(account.id, testUser.id, {
        name: 'Updated Name',
      });

      const snapshots = await prisma.snapshot.findMany({
        where: { accountId: account.id },
      });

      expect(snapshots).toHaveLength(0);
    });

    it('should throw AppError when account not found', async () => {
      await expect(
        updateAccount('nonexistent-id', testUser.id, { name: 'New Name' })
      ).rejects.toThrow(AppError);
    });

    it('should throw AppError when user unauthorized', async () => {
      const otherUser = await seedTestUser('other@example.com');
      const account = await seedTestAccount(otherUser.id);

      await expect(updateAccount(account.id, testUser.id, { name: 'New Name' })).rejects.toThrow(
        AppError
      );
    });
  });

  describe('deleteAccount', () => {
    it('should soft delete account by default', async () => {
      const account = await seedTestAccount(testUser.id);

      await deleteAccount(account.id, testUser.id);

      const deletedAccount = await prisma.account.findUnique({
        where: { id: account.id },
      });

      expect(deletedAccount).toBeTruthy();
      expect(deletedAccount?.isActive).toBe(false);
    });

    it('should hard delete account when specified', async () => {
      const account = await seedTestAccount(testUser.id);

      await deleteAccount(account.id, testUser.id, true);

      const deletedAccount = await prisma.account.findUnique({
        where: { id: account.id },
      });

      expect(deletedAccount).toBeNull();
    });

    it('should cascade delete transactions and snapshots on hard delete', async () => {
      const account = await seedTestAccount(testUser.id);
      await seedTestTransaction(account.id);

      await deleteAccount(account.id, testUser.id, true);

      const transactions = await prisma.transaction.findMany({
        where: { accountId: account.id },
      });
      const snapshots = await prisma.snapshot.findMany({
        where: { accountId: account.id },
      });

      expect(transactions).toHaveLength(0);
      expect(snapshots).toHaveLength(0);
    });

    it('should throw AppError when account not found', async () => {
      await expect(deleteAccount('nonexistent-id', testUser.id)).rejects.toThrow(AppError);
    });

    it('should throw AppError when user unauthorized', async () => {
      const otherUser = await seedTestUser('other@example.com');
      const account = await seedTestAccount(otherUser.id);

      await expect(deleteAccount(account.id, testUser.id)).rejects.toThrow(AppError);
    });
  });

  describe('getAccountSummary', () => {
    it('should return account with analytics', async () => {
      const account = await seedTestAccount(testUser.id, { currentBalance: 800 });

      // Clear initial snapshot and add custom snapshot
      await prisma.snapshot.deleteMany({ where: { accountId: account.id } });
      await prisma.snapshot.create({
        data: {
          accountId: account.id,
          balance: 1000,
          snapshotDate: new Date('2024-01-01'),
          note: 'Starting balance',
        },
      });

      // Add transactions
      await seedTestTransaction(account.id, {
        amount: 200,
        transactionType: TransactionType.PAYMENT,
        transactionDate: new Date('2024-01-15'),
      });
      await seedTestTransaction(account.id, {
        amount: 50,
        transactionType: TransactionType.CHARGE,
        transactionDate: new Date('2024-01-20'),
      });

      const result = await getAccountSummary(account.id, testUser.id);

      expect(result.account.id).toBe(account.id);
      expect(result.analytics).toBeDefined();
      expect(result.analytics.totalPayments).toBe(200);
      expect(result.analytics.totalCharges).toBe(50);
      expect(result.analytics.totalReduction).toBe(150);
      expect(result.analytics.progressPercentage).toBeGreaterThan(0);
    });

    it('should calculate progress percentage correctly', async () => {
      const account = await seedTestAccount(testUser.id, { currentBalance: 500 });

      // Set starting balance to 1000
      await prisma.snapshot.deleteMany({ where: { accountId: account.id } });
      await prisma.snapshot.create({
        data: {
          accountId: account.id,
          balance: 1000,
          snapshotDate: new Date(),
          note: 'Starting',
        },
      });

      const result = await getAccountSummary(account.id, testUser.id);

      // 500 paid off from 1000 = 50% progress
      expect(result.analytics.progressPercentage).toBeCloseTo(50, 0);
    });

    it('should handle account with no transactions', async () => {
      const account = await seedTestAccount(testUser.id);

      const result = await getAccountSummary(account.id, testUser.id);

      expect(result.account.id).toBe(account.id);
      expect(result.analytics.totalPayments).toBe(0);
      expect(result.analytics.totalCharges).toBe(0);
      expect(result.analytics.totalReduction).toBe(0);
    });

    it('should throw AppError when account not found', async () => {
      await expect(getAccountSummary('nonexistent-id', testUser.id)).rejects.toThrow(AppError);
    });

    it('should throw AppError when user unauthorized', async () => {
      const otherUser = await seedTestUser('other@example.com');
      const account = await seedTestAccount(otherUser.id);

      await expect(getAccountSummary(account.id, testUser.id)).rejects.toThrow(AppError);
    });
  });
});
