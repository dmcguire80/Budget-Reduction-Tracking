import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, afterEach } from '@jest/globals';

// Use a separate test database
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
  console.log('Test database connected');
});

afterEach(async () => {
  // Clean up database after each test
  const tables = ['Snapshot', 'Transaction', 'Account', 'User'];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
});

afterAll(async () => {
  // Disconnect from test database
  await prisma.$disconnect();
  console.log('Test database disconnected');
});

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging
};
