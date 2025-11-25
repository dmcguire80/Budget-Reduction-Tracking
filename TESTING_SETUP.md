# Testing Setup Guide

Quick guide to get tests running locally and in CI/CD.

## Current Test Status

- ✅ **Frontend Tests**: PASSING (68 tests across 2 files)
- ❌ **Backend Tests**: FAILING (requires database setup)

## Why Backend Tests Are Failing

The backend tests require a PostgreSQL database connection, but no `.env` file exists with database credentials. The tests are looking for:

- `TEST_DATABASE_URL` environment variable, OR
- `DATABASE_URL` environment variable

## How to Fix Backend Tests Locally

### Step 1: Install PostgreSQL

If you don't have PostgreSQL installed:

```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS with Homebrew
brew install postgresql@16
brew services start postgresql@16

# Or use Docker
docker run --name postgres-test -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
```

### Step 2: Create Test Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create test database
CREATE DATABASE budget_tracking_test;

# Exit psql
\q
```

### Step 3: Configure Environment

```bash
cd backend

# Copy the test environment example
cp .env.test.example .env.test

# Or create .env.test manually with:
cat > .env.test << 'EOF'
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/budget_tracking_test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/budget_tracking_test
JWT_SECRET=test-jwt-secret-minimum-32-characters-long-for-testing
REFRESH_TOKEN_SECRET=test-refresh-token-secret-min-32-chars-for-testing
NODE_ENV=test
EOF
```

### Step 4: Run Migrations

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run migrations on test database
npx prisma migrate deploy
```

### Step 5: Run Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Alternative: Use Docker for Testing

If you don't want to install PostgreSQL locally, use Docker:

```bash
# Start PostgreSQL container
docker run -d \
  --name budget-test-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=budget_tracking_test \
  -p 5432:5432 \
  postgres:16

# Wait for database to be ready
sleep 5

# Run migrations
cd backend
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/budget_tracking_test \
  npx prisma migrate deploy

# Run tests
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/budget_tracking_test \
  npm test

# Stop and remove container when done
docker stop budget-test-db
docker rm budget-test-db
```

## CI/CD Setup (GitHub Actions)

A GitHub Actions workflow has been created at `.github/workflows/tests.yml` that:

1. ✅ Automatically sets up PostgreSQL service container
2. ✅ Runs database migrations
3. ✅ Runs backend tests with coverage
4. ✅ Runs frontend tests with coverage
5. ✅ Runs linting checks
6. ✅ Runs build verification

**The workflow runs automatically on:**
- Every push to `main`, `develop`, or `claude/**` branches
- Every pull request to `main` or `develop` branches

## Quick Test Commands

### Backend
```bash
cd backend

# Run all tests
npm test

# Run specific test file
npm test -- src/__tests__/services/auth.service.test.ts

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run CI mode (no watch, with coverage)
npm run test:ci
```

### Frontend
```bash
cd frontend

# Run all tests
npm test

# Run specific test file
npm test -- src/utils/__tests__/format.test.ts

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

## Troubleshooting

### Error: "Cannot find module '@prisma/client'"

```bash
cd backend
npx prisma generate
```

### Error: "The table 'public.User' does not exist"

```bash
cd backend
npx prisma migrate deploy
```

### Error: "Port 5432 already in use"

Another PostgreSQL instance is running. Either use that instance or stop it:

```bash
# Check what's using port 5432
sudo lsof -i :5432

# Stop PostgreSQL service
sudo systemctl stop postgresql
# or
brew services stop postgresql@16
```

### Error: "password authentication failed for user postgres"

Update your `.env.test` with the correct PostgreSQL password:

```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/budget_tracking_test
```

## Test Coverage Goals

- **Backend**: 80% coverage (lines, functions, branches, statements)
- **Frontend**: 70% coverage (lines, functions, branches, statements)

View coverage reports:
```bash
# Backend
cd backend && npm run test:coverage
open coverage/lcov-report/index.html

# Frontend
cd frontend && npm run test:coverage
open coverage/index.html
```

## Next Steps

1. ✅ Set up local test database (see above)
2. ✅ Run tests locally to verify setup
3. ✅ GitHub Actions will handle CI/CD testing automatically
4. ✅ Tests must pass before merging PRs

---

For more detailed testing documentation, see [docs/TESTING.md](docs/TESTING.md).
