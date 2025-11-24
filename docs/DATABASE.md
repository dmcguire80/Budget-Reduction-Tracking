# Database Documentation

**Version:** 1.0.0
**Last Updated:** 2025-11-23
**Database:** PostgreSQL 16
**ORM:** Prisma 5.7

## Table of Contents

- [Schema Overview](#schema-overview)
- [Tables](#tables)
- [Enums](#enums)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Migrations](#migrations)
- [Seeding](#seeding)
- [Backup and Restore](#backup-and-restore)
- [Performance](#performance)
- [Query Examples](#query-examples)

---

## Schema Overview

The Budget Reduction Tracking database is designed to track users, debt accounts, transactions, and historical snapshots for financial analysis.

### Entity Relationship Diagram (Text)

```
┌──────────────┐
│     User     │
│──────────────│
│ id (PK)      │
│ email        │◄──────┐
│ passwordHash │       │
│ name         │       │
│ createdAt    │       │
│ updatedAt    │       │
└──────────────┘       │
                       │ 1:N
                       │
                ┌──────┴───────┐
                │   Account    │
                │──────────────│
                │ id (PK)      │
                │ userId (FK)  │◄─────┐
                │ name         │      │
                │ accountType  │      │
                │ currentBalance     │ 1:N
                │ creditLimit  │      │
                │ interestRate │      │
                │ minimumPayment     │
                │ dueDay       │      │
                │ isActive     │      │
                │ createdAt    │      │
                │ updatedAt    │      │
                └──────────────┘      │
                       │              │
           ┌───────────┼──────────────┤
           │ 1:N       │              │
           │           │ 1:N          │
  ┌────────▼────────┐ │     ┌────────▼────────┐
  │  Transaction    │ │     │    Snapshot     │
  │─────────────────│ │     │─────────────────│
  │ id (PK)         │ │     │ id (PK)         │
  │ accountId (FK)  │ │     │ accountId (FK)  │
  │ amount          │ │     │ balance         │
  │ transactionType │ │     │ snapshotDate    │
  │ transactionDate │ │     │ note            │
  │ description     │ │     │ createdAt       │
  │ createdAt       │ │     └─────────────────┘
  └─────────────────┘ │
```

### Database Design Philosophy

1. **Normalization**: Data is normalized to 3NF to eliminate redundancy
2. **Referential Integrity**: Foreign keys with CASCADE delete for data consistency
3. **Audit Trail**: All tables have `createdAt` and `updatedAt` timestamps
4. **UUIDs**: Primary keys use UUIDs for better distribution and security
5. **Indexing**: Strategic indexes on foreign keys and frequently queried fields

---

## Tables

### User Table

**Purpose**: Store user accounts and authentication data.

**Schema:**

```sql
CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "passwordHash" VARCHAR(255) NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL
);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT (UUID) | PRIMARY KEY | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| passwordHash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| name | VARCHAR(100) | NOT NULL | User's full name |
| createdAt | TIMESTAMP | NOT NULL | Account creation time |
| updatedAt | TIMESTAMP | NOT NULL | Last update time |

**Indexes:**

```sql
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
```

**Relationships:**

- One-to-many with Account table

**Constraints:**

- Email must be unique
- Password must be hashed (handled by application)
- Name is required

**Example Query:**

```sql
-- Get user by email
SELECT * FROM "User" WHERE email = 'user@example.com';

-- Get user with all accounts
SELECT u.*, a.*
FROM "User" u
LEFT JOIN "Account" a ON u.id = a."userId"
WHERE u.id = 'user-uuid';
```

**Prisma Model:**

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  name         String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  accounts     Account[]

  @@index([email])
}
```

---

### Account Table

**Purpose**: Store debt account information (credit cards, loans, mortgages).

**Schema:**

```sql
CREATE TABLE "Account" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "accountType" "AccountType" NOT NULL,
  "currentBalance" DECIMAL(12,2) NOT NULL,
  "creditLimit" DECIMAL(12,2),
  "interestRate" DECIMAL(5,2) NOT NULL,
  "minimumPayment" DECIMAL(12,2),
  "dueDay" INTEGER,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT (UUID) | PRIMARY KEY | Unique identifier |
| userId | TEXT (UUID) | NOT NULL, FK | Owner of the account |
| name | VARCHAR(100) | NOT NULL | Account name (e.g., "Chase Freedom") |
| accountType | ENUM | NOT NULL | Type of debt account |
| currentBalance | DECIMAL(12,2) | NOT NULL | Current amount owed |
| creditLimit | DECIMAL(12,2) | NULLABLE | Maximum credit limit |
| interestRate | DECIMAL(5,2) | NOT NULL | APR as percentage (e.g., 18.99) |
| minimumPayment | DECIMAL(12,2) | NULLABLE | Required minimum payment |
| dueDay | INTEGER | NULLABLE | Day of month payment is due (1-31) |
| isActive | BOOLEAN | NOT NULL | Whether account is active |
| createdAt | TIMESTAMP | NOT NULL | Account creation time |
| updatedAt | TIMESTAMP | NOT NULL | Last update time |

**Indexes:**

```sql
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE INDEX "Account_accountType_idx" ON "Account"("accountType");
```

**Relationships:**

- Many-to-one with User table
- One-to-many with Transaction table
- One-to-many with Snapshot table

**Constraints:**

- userId references User.id with CASCADE delete
- currentBalance must be >= 0
- creditLimit must be >= 0 (if provided)
- interestRate must be between 0 and 100
- dueDay must be between 1 and 31 (if provided)

**Example Queries:**

```sql
-- Get all active accounts for a user
SELECT * FROM "Account"
WHERE "userId" = 'user-uuid'
  AND "isActive" = true
ORDER BY "currentBalance" DESC;

-- Get credit card accounts with high utilization
SELECT *,
  CASE
    WHEN "creditLimit" > 0 THEN
      ("currentBalance" / "creditLimit") * 100
    ELSE 0
  END AS "utilizationRate"
FROM "Account"
WHERE "userId" = 'user-uuid'
  AND "accountType" = 'CREDIT_CARD'
  AND "creditLimit" IS NOT NULL
HAVING "utilizationRate" > 70;

-- Get account with transactions
SELECT a.*, t.*
FROM "Account" a
LEFT JOIN "Transaction" t ON a.id = t."accountId"
WHERE a.id = 'account-uuid'
ORDER BY t."transactionDate" DESC;
```

**Prisma Model:**

```prisma
model Account {
  id             String        @id @default(uuid())
  userId         String
  name           String
  accountType    AccountType
  currentBalance Decimal       @db.Decimal(12, 2)
  creditLimit    Decimal?      @db.Decimal(12, 2)
  interestRate   Decimal       @db.Decimal(5, 2)
  minimumPayment Decimal?      @db.Decimal(12, 2)
  dueDay         Int?
  isActive       Boolean       @default(true)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions   Transaction[]
  snapshots      Snapshot[]

  @@index([userId])
  @@index([accountType])
}
```

---

### Transaction Table

**Purpose**: Record financial transactions (payments, charges, adjustments).

**Schema:**

```sql
CREATE TABLE "Transaction" (
  "id" TEXT PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "transactionType" "TransactionType" NOT NULL,
  "transactionDate" TIMESTAMP NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE
);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT (UUID) | PRIMARY KEY | Unique identifier |
| accountId | TEXT (UUID) | NOT NULL, FK | Account this transaction belongs to |
| amount | DECIMAL(12,2) | NOT NULL | Transaction amount (negative for payments) |
| transactionType | ENUM | NOT NULL | Type of transaction |
| transactionDate | TIMESTAMP | NOT NULL | When transaction occurred |
| description | TEXT | NULLABLE | Optional description or note |
| createdAt | TIMESTAMP | NOT NULL | Record creation time |

**Indexes:**

```sql
CREATE INDEX "Transaction_accountId_idx" ON "Transaction"("accountId");
CREATE INDEX "Transaction_transactionDate_idx" ON "Transaction"("transactionDate");
```

**Relationships:**

- Many-to-one with Account table

**Constraints:**

- accountId references Account.id with CASCADE delete
- transactionDate is required
- Amount convention: negative for payments, positive for charges

**Example Queries:**

```sql
-- Get all transactions for an account
SELECT * FROM "Transaction"
WHERE "accountId" = 'account-uuid'
ORDER BY "transactionDate" DESC;

-- Get payments for the last 30 days
SELECT * FROM "Transaction"
WHERE "accountId" = 'account-uuid'
  AND "transactionType" = 'PAYMENT'
  AND "transactionDate" >= NOW() - INTERVAL '30 days'
ORDER BY "transactionDate" DESC;

-- Calculate total payments and charges
SELECT
  SUM(CASE WHEN "transactionType" = 'PAYMENT' THEN ABS("amount") ELSE 0 END) AS "totalPayments",
  SUM(CASE WHEN "transactionType" = 'CHARGE' THEN "amount" ELSE 0 END) AS "totalCharges"
FROM "Transaction"
WHERE "accountId" = 'account-uuid';

-- Get monthly transaction summary
SELECT
  DATE_TRUNC('month', "transactionDate") AS month,
  "transactionType",
  COUNT(*) AS count,
  SUM("amount") AS total
FROM "Transaction"
WHERE "accountId" = 'account-uuid'
GROUP BY month, "transactionType"
ORDER BY month DESC;
```

**Prisma Model:**

```prisma
model Transaction {
  id              String          @id @default(uuid())
  accountId       String
  amount          Decimal         @db.Decimal(12, 2)
  transactionType TransactionType
  transactionDate DateTime
  description     String?
  createdAt       DateTime        @default(now())
  account         Account         @relation(fields: [accountId], references: [id], onDelete: Cascade)

  @@index([accountId])
  @@index([transactionDate])
}
```

---

### Snapshot Table

**Purpose**: Store point-in-time balance records for historical tracking and charting.

**Schema:**

```sql
CREATE TABLE "Snapshot" (
  "id" TEXT PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "balance" DECIMAL(12,2) NOT NULL,
  "snapshotDate" TIMESTAMP NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE
);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT (UUID) | PRIMARY KEY | Unique identifier |
| accountId | TEXT (UUID) | NOT NULL, FK | Account this snapshot belongs to |
| balance | DECIMAL(12,2) | NOT NULL | Balance at snapshot time |
| snapshotDate | TIMESTAMP | NOT NULL | When snapshot was taken |
| note | TEXT | NULLABLE | Optional note about the snapshot |
| createdAt | TIMESTAMP | NOT NULL | Record creation time |

**Indexes:**

```sql
CREATE INDEX "Snapshot_accountId_idx" ON "Snapshot"("accountId");
CREATE INDEX "Snapshot_snapshotDate_idx" ON "Snapshot"("snapshotDate");
```

**Relationships:**

- Many-to-one with Account table

**Constraints:**

- accountId references Account.id with CASCADE delete
- balance must be >= 0
- snapshotDate is required

**Example Queries:**

```sql
-- Get all snapshots for an account
SELECT * FROM "Snapshot"
WHERE "accountId" = 'account-uuid'
ORDER BY "snapshotDate" ASC;

-- Get snapshots for date range (for charting)
SELECT * FROM "Snapshot"
WHERE "accountId" = 'account-uuid'
  AND "snapshotDate" >= '2025-01-01'
  AND "snapshotDate" <= '2025-12-31'
ORDER BY "snapshotDate" ASC;

-- Calculate balance change over time
SELECT
  s1."snapshotDate" AS date,
  s1.balance AS current_balance,
  LAG(s1.balance) OVER (ORDER BY s1."snapshotDate") AS previous_balance,
  s1.balance - LAG(s1.balance) OVER (ORDER BY s1."snapshotDate") AS change
FROM "Snapshot" s1
WHERE s1."accountId" = 'account-uuid'
ORDER BY s1."snapshotDate" ASC;

-- Get most recent snapshot
SELECT * FROM "Snapshot"
WHERE "accountId" = 'account-uuid'
ORDER BY "snapshotDate" DESC
LIMIT 1;
```

**Prisma Model:**

```prisma
model Snapshot {
  id           String   @id @default(uuid())
  accountId    String
  balance      Decimal  @db.Decimal(12, 2)
  snapshotDate DateTime
  note         String?
  createdAt    DateTime @default(now())
  account      Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)

  @@index([accountId])
  @@index([snapshotDate])
}
```

---

## Enums

### AccountType

**Purpose**: Define the type of debt account.

**Values:**

| Value | Description | Typical Use Case |
|-------|-------------|------------------|
| CREDIT_CARD | Credit card | Revolving credit accounts |
| PERSONAL_LOAN | Personal/unsecured loan | Fixed-term personal loans |
| AUTO_LOAN | Auto/vehicle loan | Car financing |
| MORTGAGE | Home mortgage | Home loans |
| STUDENT_LOAN | Student loan | Education debt |
| OTHER | Other debt type | Any other debt |

**SQL Definition:**

```sql
CREATE TYPE "AccountType" AS ENUM (
  'CREDIT_CARD',
  'PERSONAL_LOAN',
  'AUTO_LOAN',
  'MORTGAGE',
  'STUDENT_LOAN',
  'OTHER'
);
```

**Prisma Definition:**

```prisma
enum AccountType {
  CREDIT_CARD
  PERSONAL_LOAN
  AUTO_LOAN
  MORTGAGE
  STUDENT_LOAN
  OTHER
}
```

---

### TransactionType

**Purpose**: Define the type of financial transaction.

**Values:**

| Value | Description | Amount Convention |
|-------|-------------|-------------------|
| PAYMENT | Money paid toward debt | Negative (reduces balance) |
| CHARGE | New purchase or charge | Positive (increases balance) |
| ADJUSTMENT | Manual balance correction | Positive or negative |
| INTEREST | Interest charges | Positive (increases balance) |

**SQL Definition:**

```sql
CREATE TYPE "TransactionType" AS ENUM (
  'PAYMENT',
  'CHARGE',
  'ADJUSTMENT',
  'INTEREST'
);
```

**Prisma Definition:**

```prisma
enum TransactionType {
  PAYMENT
  CHARGE
  ADJUSTMENT
  INTEREST
}
```

---

## Relationships

### User → Account (One-to-Many)

```sql
-- A user can have multiple accounts
SELECT u.name, COUNT(a.id) AS account_count
FROM "User" u
LEFT JOIN "Account" a ON u.id = a."userId"
GROUP BY u.id;
```

### Account → Transaction (One-to-Many)

```sql
-- An account can have multiple transactions
SELECT a.name, COUNT(t.id) AS transaction_count
FROM "Account" a
LEFT JOIN "Transaction" t ON a.id = t."accountId"
WHERE a."userId" = 'user-uuid'
GROUP BY a.id;
```

### Account → Snapshot (One-to-Many)

```sql
-- An account can have multiple snapshots
SELECT a.name, COUNT(s.id) AS snapshot_count
FROM "Account" a
LEFT JOIN "Snapshot" s ON a.id = s."accountId"
WHERE a."userId" = 'user-uuid'
GROUP BY a.id;
```

---

## Indexes

### Purpose of Each Index

**User Table:**
- `User_email_key` (Unique): Fast login lookup
- `User_email_idx`: Fast email-based queries

**Account Table:**
- `Account_userId_idx`: Fast user account retrieval
- `Account_accountType_idx`: Filter accounts by type

**Transaction Table:**
- `Transaction_accountId_idx`: Fast account transaction retrieval
- `Transaction_transactionDate_idx`: Date range queries for charts

**Snapshot Table:**
- `Snapshot_accountId_idx`: Fast account snapshot retrieval
- `Snapshot_snapshotDate_idx`: Date range queries for charts

### Index Performance

**Before Index:**
```sql
EXPLAIN ANALYZE
SELECT * FROM "Transaction"
WHERE "accountId" = 'uuid'
ORDER BY "transactionDate" DESC;
-- Seq Scan: ~100ms for 1000 rows
```

**After Index:**
```sql
EXPLAIN ANALYZE
SELECT * FROM "Transaction"
WHERE "accountId" = 'uuid'
ORDER BY "transactionDate" DESC;
-- Index Scan: ~5ms for 1000 rows
```

---

## Migrations

### Creating Migrations

**Development:**

```bash
# Create a new migration
npx prisma migrate dev --name add_new_feature

# Prisma will:
# 1. Generate SQL migration file
# 2. Apply migration to database
# 3. Regenerate Prisma Client
```

**Production:**

```bash
# Apply migrations without creating new ones
npx prisma migrate deploy
```

### Migration Files

Located in `backend/prisma/migrations/`:

```
migrations/
├── 20251123000001_init/
│   └── migration.sql
├── 20251123000002_add_snapshots/
│   └── migration.sql
└── migration_lock.toml
```

### Rollback Migrations

**Development:**

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Apply specific migration
npx prisma migrate resolve --applied 20251123000001_init
```

**Production:**

⚠️ **Warning**: Prisma doesn't support automatic rollback. Options:

1. **Manual Rollback**: Write reverse SQL and execute
2. **Database Backup**: Restore from backup
3. **Forward Fix**: Create new migration to fix issue

### Migration Best Practices

1. **Always review generated SQL** before applying
2. **Test migrations** on development database first
3. **Backup production** database before migrations
4. **Use transactions** for multi-step migrations
5. **Document breaking changes** in migration notes

---

## Seeding

### Seed File

Located at `backend/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 12);

  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      passwordHash: hashedPassword,
      name: 'Test User',
    },
  });

  // Create test accounts
  await prisma.account.createMany({
    data: [
      {
        userId: user.id,
        name: 'Chase Freedom',
        accountType: 'CREDIT_CARD',
        currentBalance: 5420.50,
        creditLimit: 10000,
        interestRate: 18.99,
        minimumPayment: 150,
        dueDay: 15,
      },
      {
        userId: user.id,
        name: 'Auto Loan',
        accountType: 'AUTO_LOAN',
        currentBalance: 20000,
        interestRate: 5.99,
        minimumPayment: 350,
      },
    ],
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Running Seed

```bash
# Run seed
npm run seed

# Or
npx prisma db seed
```

### Development vs. Production Seeds

**Development:**
- Include test users
- Include sample data
- Use weak passwords (for testing)

**Production:**
- Only essential data
- No test users
- No sample data

---

## Backup and Restore

### Backup Procedures

**Manual Backup:**

```bash
# Full database backup
pg_dump -U budget_user budget_tracking > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
pg_dump -U budget_user budget_tracking | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Schema only
pg_dump -U budget_user --schema-only budget_tracking > schema_backup.sql

# Data only
pg_dump -U budget_user --data-only budget_tracking > data_backup.sql
```

**Automated Backup Script:**

Create `scripts/backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/budget-tracking"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="budget_tracking_$TIMESTAMP.sql.gz"

# Create backup
pg_dump -U budget_user budget_tracking | gzip > "$BACKUP_DIR/$FILENAME"

# Keep only last 30 days
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $FILENAME"
```

**Cron Job:**

```bash
# Edit crontab
crontab -e

# Add daily backup at 3 AM
0 3 * * * /opt/budget-tracking/scripts/backup-db.sh
```

---

### Restore Procedures

**From SQL File:**

```bash
# Restore uncompressed backup
psql -U budget_user budget_tracking < backup_20251123_030000.sql

# Restore compressed backup
gunzip -c backup_20251123_030000.sql.gz | psql -U budget_user budget_tracking
```

**Complete Restore:**

```bash
# 1. Drop existing database
dropdb -U postgres budget_tracking

# 2. Create fresh database
createdb -U postgres budget_tracking

# 3. Grant permissions
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE budget_tracking TO budget_user;"

# 4. Restore backup
psql -U budget_user budget_tracking < backup_20251123_030000.sql
```

---

### Backup Schedule Recommendations

**Development:**
- **Frequency**: Before major changes
- **Retention**: 7 days
- **Method**: Manual

**Production:**
- **Frequency**: Daily at 3 AM
- **Retention**: 30 days
- **Method**: Automated cron job
- **Location**: Off-site storage

---

## Performance

### Connection Pooling

**Configuration:**

```env
# In DATABASE_URL
DATABASE_URL="postgresql://user:pass@localhost:5432/db?connection_limit=10"
```

**Prisma Default:**
- Connection pool size: 10
- Timeout: 10 seconds
- Auto-managed by Prisma

---

### Query Optimization Tips

**1. Use Indexes:**

```sql
-- Bad: Full table scan
SELECT * FROM "Transaction" WHERE "description" LIKE '%payment%';

-- Good: Index scan
SELECT * FROM "Transaction" WHERE "accountId" = 'uuid';
```

**2. Select Only Needed Columns:**

```typescript
// Bad
const accounts = await prisma.account.findMany();

// Good
const accounts = await prisma.account.findMany({
  select: { id: true, name: true, currentBalance: true }
});
```

**3. Use Pagination:**

```typescript
// Paginate large result sets
const transactions = await prisma.transaction.findMany({
  skip: page * pageSize,
  take: pageSize,
  orderBy: { transactionDate: 'desc' }
});
```

**4. Avoid N+1 Queries:**

```typescript
// Bad: N+1 query
const accounts = await prisma.account.findMany();
for (const account of accounts) {
  const transactions = await prisma.transaction.findMany({
    where: { accountId: account.id }
  });
}

// Good: Single query with include
const accounts = await prisma.account.findMany({
  include: { transactions: true }
});
```

---

### Database Maintenance

**VACUUM:**

```sql
-- Reclaim storage and update statistics
VACUUM ANALYZE "Transaction";
VACUUM ANALYZE "Account";
VACUUM ANALYZE "Snapshot";

-- Full vacuum (requires exclusive lock)
VACUUM FULL "Transaction";
```

**REINDEX:**

```sql
-- Rebuild indexes
REINDEX TABLE "Transaction";
REINDEX TABLE "Account";
```

**Analyze:**

```sql
-- Update statistics
ANALYZE "Transaction";
ANALYZE "Account";
```

**Automated Maintenance:**

PostgreSQL's `autovacuum` runs automatically. Configure in `postgresql.conf`:

```conf
autovacuum = on
autovacuum_vacuum_scale_factor = 0.1
autovacuum_analyze_scale_factor = 0.05
```

---

## Query Examples

### Complex Queries

**Get account summary with aggregates:**

```sql
SELECT
  a.id,
  a.name,
  a."currentBalance",
  COUNT(t.id) AS transaction_count,
  SUM(CASE WHEN t."transactionType" = 'PAYMENT' THEN ABS(t.amount) ELSE 0 END) AS total_payments,
  SUM(CASE WHEN t."transactionType" = 'CHARGE' THEN t.amount ELSE 0 END) AS total_charges,
  MAX(t."transactionDate") FILTER (WHERE t."transactionType" = 'PAYMENT') AS last_payment_date
FROM "Account" a
LEFT JOIN "Transaction" t ON a.id = t."accountId"
WHERE a."userId" = 'user-uuid'
GROUP BY a.id
ORDER BY a."currentBalance" DESC;
```

**Calculate debt reduction over time:**

```sql
WITH monthly_balances AS (
  SELECT
    DATE_TRUNC('month', "snapshotDate") AS month,
    AVG(balance) AS avg_balance
  FROM "Snapshot"
  WHERE "accountId" = 'account-uuid'
  GROUP BY month
)
SELECT
  month,
  avg_balance,
  LAG(avg_balance) OVER (ORDER BY month) AS previous_balance,
  avg_balance - LAG(avg_balance) OVER (ORDER BY month) AS reduction
FROM monthly_balances
ORDER BY month DESC;
```

**Get top accounts by interest cost:**

```sql
SELECT
  a.name,
  a."currentBalance",
  a."interestRate",
  (a."currentBalance" * a."interestRate" / 100 / 12) AS monthly_interest
FROM "Account" a
WHERE a."userId" = 'user-uuid'
  AND a."isActive" = true
ORDER BY monthly_interest DESC
LIMIT 5;
```

---

## Conclusion

This database documentation provides a comprehensive reference for the Budget Reduction Tracking database schema. For implementation examples and API usage, refer to:

- [API Documentation](./API.md)
- [Development Guide](./DEVELOPMENT.md)
- [Architecture Document](../ARCHITECTURE.md)

---

**Last Updated**: 2025-11-23
