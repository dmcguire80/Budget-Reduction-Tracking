import { PrismaClient, AccountType, TransactionType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

export async function setupTestDatabase() {
  await prisma.$connect();
  console.log('Test database connected');
}

export async function teardownTestDatabase() {
  await prisma.$disconnect();
  console.log('Test database disconnected');
}

export async function clearDatabase() {
  const tables = ['Snapshot', 'Transaction', 'Account', 'User'];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
}

export async function seedTestUser(email = 'test@example.com', password = 'password123', name = 'Test User') {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
    },
  });

  return user;
}

export async function seedTestAccount(
  userId: string,
  data: {
    name?: string;
    accountType?: AccountType;
    currentBalance?: number;
    creditLimit?: number;
    interestRate?: number;
    minimumPayment?: number;
    dueDay?: number;
  } = {}
) {
  const account = await prisma.account.create({
    data: {
      userId,
      name: data.name || 'Test Credit Card',
      accountType: data.accountType || AccountType.CREDIT_CARD,
      currentBalance: data.currentBalance || 1000,
      creditLimit: data.creditLimit || 5000,
      interestRate: data.interestRate || 18.99,
      minimumPayment: data.minimumPayment || 25,
      dueDay: data.dueDay || 15,
    },
  });

  return account;
}

export async function seedTestTransaction(
  accountId: string,
  data: {
    amount?: number;
    transactionType?: TransactionType;
    transactionDate?: Date;
    description?: string;
  } = {}
) {
  const transaction = await prisma.transaction.create({
    data: {
      accountId,
      amount: data.amount || 100,
      transactionType: data.transactionType || TransactionType.PAYMENT,
      transactionDate: data.transactionDate || new Date(),
      description: data.description || 'Test transaction',
    },
  });

  return transaction;
}

export async function seedTestSnapshot(
  accountId: string,
  data: {
    balance?: number;
    snapshotDate?: Date;
    note?: string;
  } = {}
) {
  const snapshot = await prisma.snapshot.create({
    data: {
      accountId,
      balance: data.balance || 1000,
      snapshotDate: data.snapshotDate || new Date(),
      note: data.note || 'Test snapshot',
    },
  });

  return snapshot;
}

export { prisma as testPrisma };
