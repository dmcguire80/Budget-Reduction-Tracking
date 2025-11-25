import { PrismaClient, AccountType, TransactionType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.snapshot.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data');

  // Create demo user
  const passwordHash = await bcrypt.hash('demo123', 12);
  const user = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      passwordHash,
      name: 'Demo User',
    },
  });

  console.log(`Created user: ${user.email}`);

  // Create sample accounts
  const creditCard = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Chase Freedom',
      accountType: AccountType.CREDIT_CARD,
      currentBalance: 3542.75,
      creditLimit: 10000,
      interestRate: 18.99,
      minimumPayment: 125,
      dueDay: 15,
      isActive: true,
    },
  });

  const personalLoan = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Personal Loan - Bank of America',
      accountType: AccountType.PERSONAL_LOAN,
      currentBalance: 8750.00,
      interestRate: 9.5,
      minimumPayment: 250,
      dueDay: 1,
      isActive: true,
    },
  });

  const autoLoan = await prisma.account.create({
    data: {
      userId: user.id,
      name: '2021 Honda Civic',
      accountType: AccountType.AUTO_LOAN,
      currentBalance: 15420.50,
      interestRate: 4.25,
      minimumPayment: 425,
      dueDay: 20,
      isActive: true,
    },
  });

  const studentLoan = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Federal Student Loan',
      accountType: AccountType.STUDENT_LOAN,
      currentBalance: 22350.00,
      interestRate: 5.5,
      minimumPayment: 185,
      dueDay: 10,
      isActive: true,
    },
  });

  console.log('Created 4 sample accounts');

  // Create sample transactions
  const now = new Date();
  const transactions = [];

  // Credit Card transactions
  transactions.push(
    prisma.transaction.create({
      data: {
        accountId: creditCard.id,
        amount: -200.00,
        transactionType: TransactionType.PAYMENT,
        transactionDate: new Date(now.getFullYear(), now.getMonth() - 3, 15),
        description: 'Monthly payment',
      },
    }),
    prisma.transaction.create({
      data: {
        accountId: creditCard.id,
        amount: 45.50,
        transactionType: TransactionType.CHARGE,
        transactionDate: new Date(now.getFullYear(), now.getMonth() - 2, 8),
        description: 'Restaurant purchase',
      },
    }),
    prisma.transaction.create({
      data: {
        accountId: creditCard.id,
        amount: -250.00,
        transactionType: TransactionType.PAYMENT,
        transactionDate: new Date(now.getFullYear(), now.getMonth() - 2, 15),
        description: 'Monthly payment',
      },
    }),
    prisma.transaction.create({
      data: {
        accountId: creditCard.id,
        amount: -300.00,
        transactionType: TransactionType.PAYMENT,
        transactionDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
        description: 'Monthly payment',
      },
    })
  );

  // Personal Loan transactions
  transactions.push(
    prisma.transaction.create({
      data: {
        accountId: personalLoan.id,
        amount: -250.00,
        transactionType: TransactionType.PAYMENT,
        transactionDate: new Date(now.getFullYear(), now.getMonth() - 3, 1),
        description: 'Monthly payment',
      },
    }),
    prisma.transaction.create({
      data: {
        accountId: personalLoan.id,
        amount: -250.00,
        transactionType: TransactionType.PAYMENT,
        transactionDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        description: 'Monthly payment',
      },
    }),
    prisma.transaction.create({
      data: {
        accountId: personalLoan.id,
        amount: -250.00,
        transactionType: TransactionType.PAYMENT,
        transactionDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        description: 'Monthly payment',
      },
    })
  );

  // Auto Loan transactions
  transactions.push(
    prisma.transaction.create({
      data: {
        accountId: autoLoan.id,
        amount: -425.00,
        transactionType: TransactionType.PAYMENT,
        transactionDate: new Date(now.getFullYear(), now.getMonth() - 3, 20),
        description: 'Monthly payment',
      },
    }),
    prisma.transaction.create({
      data: {
        accountId: autoLoan.id,
        amount: -425.00,
        transactionType: TransactionType.PAYMENT,
        transactionDate: new Date(now.getFullYear(), now.getMonth() - 2, 20),
        description: 'Monthly payment',
      },
    }),
    prisma.transaction.create({
      data: {
        accountId: autoLoan.id,
        amount: -425.00,
        transactionType: TransactionType.PAYMENT,
        transactionDate: new Date(now.getFullYear(), now.getMonth() - 1, 20),
        description: 'Monthly payment',
      },
    })
  );

  // Student Loan transactions
  transactions.push(
    prisma.transaction.create({
      data: {
        accountId: studentLoan.id,
        amount: -185.00,
        transactionType: TransactionType.PAYMENT,
        transactionDate: new Date(now.getFullYear(), now.getMonth() - 3, 10),
        description: 'Monthly payment',
      },
    }),
    prisma.transaction.create({
      data: {
        accountId: studentLoan.id,
        amount: -185.00,
        transactionType: TransactionType.PAYMENT,
        transactionDate: new Date(now.getFullYear(), now.getMonth() - 2, 10),
        description: 'Monthly payment',
      },
    }),
    prisma.transaction.create({
      data: {
        accountId: studentLoan.id,
        amount: -185.00,
        transactionType: TransactionType.PAYMENT,
        transactionDate: new Date(now.getFullYear(), now.getMonth() - 1, 10),
        description: 'Monthly payment',
      },
    }),
    prisma.transaction.create({
      data: {
        accountId: studentLoan.id,
        amount: 102.44,
        transactionType: TransactionType.INTEREST,
        transactionDate: new Date(now.getFullYear(), now.getMonth() - 1, 28),
        description: 'Monthly interest charge',
      },
    })
  );

  await Promise.all(transactions);
  console.log('Created 15 sample transactions');

  // Create sample snapshots
  const snapshots = [];

  // Credit Card snapshots
  snapshots.push(
    prisma.snapshot.create({
      data: {
        accountId: creditCard.id,
        balance: 4200.00,
        snapshotDate: new Date(now.getFullYear(), now.getMonth() - 3, 1),
        note: 'Q4 2024 snapshot',
      },
    }),
    prisma.snapshot.create({
      data: {
        accountId: creditCard.id,
        balance: 3950.50,
        snapshotDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        note: 'After extra payment',
      },
    }),
    prisma.snapshot.create({
      data: {
        accountId: creditCard.id,
        balance: 3542.75,
        snapshotDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        note: 'Current balance',
      },
    })
  );

  // Personal Loan snapshots
  snapshots.push(
    prisma.snapshot.create({
      data: {
        accountId: personalLoan.id,
        balance: 9500.00,
        snapshotDate: new Date(now.getFullYear(), now.getMonth() - 3, 1),
      },
    }),
    prisma.snapshot.create({
      data: {
        accountId: personalLoan.id,
        balance: 9000.00,
        snapshotDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
      },
    }),
    prisma.snapshot.create({
      data: {
        accountId: personalLoan.id,
        balance: 8750.00,
        snapshotDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      },
    })
  );

  // Auto Loan snapshots
  snapshots.push(
    prisma.snapshot.create({
      data: {
        accountId: autoLoan.id,
        balance: 16695.50,
        snapshotDate: new Date(now.getFullYear(), now.getMonth() - 3, 1),
      },
    }),
    prisma.snapshot.create({
      data: {
        accountId: autoLoan.id,
        balance: 16058.00,
        snapshotDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
      },
    }),
    prisma.snapshot.create({
      data: {
        accountId: autoLoan.id,
        balance: 15420.50,
        snapshotDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      },
    })
  );

  // Student Loan snapshots
  snapshots.push(
    prisma.snapshot.create({
      data: {
        accountId: studentLoan.id,
        balance: 22905.00,
        snapshotDate: new Date(now.getFullYear(), now.getMonth() - 3, 1),
      },
    })
  );

  await Promise.all(snapshots);
  console.log('Created 10 sample snapshots');

  console.log('Database seed completed successfully!');
  console.log('\nDemo User Credentials:');
  console.log('Email: demo@example.com');
  console.log('Password: demo123');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
