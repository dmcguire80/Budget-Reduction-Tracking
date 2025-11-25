# Development Guide

**Version:** 1.0.0
**Last Updated:** 2025-11-23

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Adding New Features](#adding-new-features)
- [Debugging](#debugging)
- [Testing](#testing)
- [Performance](#performance)
- [Security](#security)

---

## Development Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20 LTS or higher
- **npm**: Version 10 or higher
- **PostgreSQL**: Version 16 or higher
- **Git**: Latest version
- **Code Editor**: VS Code recommended with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Prisma

### System Requirements

**Minimum:**
- 4 GB RAM
- 10 GB free disk space
- Dual-core processor

**Recommended:**
- 8 GB RAM
- 20 GB free disk space
- Quad-core processor

---

### Cloning the Repository

```bash
# Clone the repository
git clone https://github.com/dmcguire80/Budget-Reduction-Tracking.git
cd Budget-Reduction-Tracking
```

---

### Installing Dependencies

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required Environment Variables:**

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/budget_tracking

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-change-this
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required Environment Variables:**

```env
# API Configuration
VITE_API_URL=http://localhost:3001

# App Configuration
VITE_APP_NAME=Budget Reduction Tracker
```

---

### Database Setup

#### Option 1: Local PostgreSQL

**Install PostgreSQL:**

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql@16
brew services start postgresql@16

# Verify installation
psql --version
```

**Create Database:**

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE budget_tracking;
CREATE USER budget_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE budget_tracking TO budget_user;

# Grant schema permissions
\c budget_tracking
GRANT ALL ON SCHEMA public TO budget_user;

# Exit
\q
```

**Run Migrations:**

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Optional: Seed database with sample data
npm run seed
```

#### Option 2: Docker PostgreSQL

```bash
# Run PostgreSQL in Docker
docker run -d \
  --name budget-tracking-db \
  -e POSTGRES_PASSWORD=dev_password \
  -e POSTGRES_DB=budget_tracking \
  -e POSTGRES_USER=budget_user \
  -p 5432:5432 \
  postgres:16

# Verify it's running
docker ps

# Run migrations (from backend directory)
npx prisma migrate dev
```

---

### Running in Development Mode

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Backend will start on `http://localhost:3001` with hot reload.

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Frontend will start on `http://localhost:5173` with hot reload.

**Terminal 3 - Prisma Studio (Optional):**

```bash
cd backend
npm run prisma:studio
```

Prisma Studio will start on `http://localhost:5555` for database visualization.

---

### Verifying Setup

1. Open browser to `http://localhost:5173`
2. You should see the login page
3. Register a new account
4. Add a test account
5. Add a test transaction
6. Check the dashboard updates

**Quick Test:**

```bash
# Test backend health
curl http://localhost:3001/api/health

# Expected response:
# {"success":true,"message":"API is healthy",...}
```

---

## Project Structure

### Backend Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   └── env.config.ts    # Environment configuration
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── account.controller.ts
│   │   ├── transaction.controller.ts
│   │   ├── snapshot.controller.ts
│   │   └── analytics.controller.ts
│   ├── services/            # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── account.service.ts
│   │   ├── transaction.service.ts
│   │   ├── snapshot.service.ts
│   │   └── analytics.service.ts
│   ├── routes/              # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── account.routes.ts
│   │   ├── transaction.routes.ts
│   │   ├── snapshot.routes.ts
│   │   ├── analytics.routes.ts
│   │   └── health.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.ts
│   │   ├── validate.middleware.ts
│   │   └── rateLimiter.ts
│   ├── validators/          # Request validation schemas
│   │   ├── auth.validator.ts
│   │   ├── account.validator.ts
│   │   ├── transaction.validator.ts
│   │   ├── snapshot.validator.ts
│   │   └── analytics.validator.ts
│   ├── utils/               # Utility functions
│   │   ├── jwt.util.ts
│   │   ├── password.util.ts
│   │   ├── calculation.util.ts
│   │   └── logger.util.ts
│   ├── types/               # TypeScript type definitions
│   │   └── express.d.ts
│   └── index.ts             # Application entry point
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Database migrations
│   └── seed.ts              # Database seed file
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

**Directory Purposes:**

- **config/**: Environment and configuration management
- **controllers/**: Handle HTTP requests, validate input, call services, return responses
- **services/**: Contain business logic, interact with database, handle complex operations
- **routes/**: Define API endpoints and map to controllers
- **middleware/**: Process requests before they reach controllers
- **validators/**: Define and validate request schemas using Zod
- **utils/**: Reusable utility functions
- **types/**: TypeScript type definitions and interfaces

---

### Frontend Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── common/          # Reusable components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorMessage.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── auth/            # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── accounts/        # Account components
│   │   │   ├── AccountCard.tsx
│   │   │   ├── AccountForm.tsx
│   │   │   ├── AccountModal.tsx
│   │   │   └── AccountStats.tsx
│   │   ├── transactions/    # Transaction components
│   │   │   ├── TransactionList.tsx
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── TransactionModal.tsx
│   │   │   └── QuickTransactionForm.tsx
│   │   ├── charts/          # Chart components
│   │   │   ├── BalanceReductionChart.tsx
│   │   │   ├── InterestForecastChart.tsx
│   │   │   ├── PaymentDistributionChart.tsx
│   │   │   ├── ProgressChart.tsx
│   │   │   ├── ProjectionChart.tsx
│   │   │   └── UtilizationChart.tsx
│   │   └── dashboard/       # Dashboard components
│   │       ├── SummaryCard.tsx
│   │       ├── RecentActivity.tsx
│   │       ├── QuickActions.tsx
│   │       └── ProgressOverview.tsx
│   ├── pages/               # Page components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Accounts.tsx
│   │   ├── AccountDetail.tsx
│   │   ├── Transactions.tsx
│   │   └── NotFound.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useAccounts.ts
│   │   ├── useTransactions.ts
│   │   ├── useAnalytics.ts
│   │   └── useDebounce.ts
│   ├── services/            # API service layer
│   │   ├── api.ts           # Axios instance
│   │   ├── auth.service.ts
│   │   ├── account.service.ts
│   │   ├── transaction.service.ts
│   │   └── analytics.service.ts
│   ├── context/             # React context providers
│   │   └── AuthContext.tsx
│   ├── types/               # TypeScript types
│   │   ├── auth.types.ts
│   │   ├── account.types.ts
│   │   ├── transaction.types.ts
│   │   └── analytics.types.ts
│   ├── utils/               # Utility functions
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── calculations.ts
│   ├── validators/          # Form validation schemas
│   │   ├── account.validator.ts
│   │   └── transaction.validator.ts
│   ├── config/              # Configuration
│   │   └── constants.ts
│   ├── App.tsx              # Main App component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── .env.example
└── README.md
```

**Directory Purposes:**

- **components/**: Reusable React components organized by feature
- **pages/**: Top-level page components (one per route)
- **hooks/**: Custom React hooks for shared logic
- **services/**: API client functions
- **context/**: React Context providers for global state
- **types/**: TypeScript interfaces and types
- **utils/**: Helper functions and utilities
- **validators/**: Form validation schemas

---

### File Naming Conventions

**Backend:**
- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- Routes: `*.routes.ts`
- Validators: `*.validator.ts`
- Middleware: `*.middleware.ts`
- Utils: `*.util.ts`

**Frontend:**
- Components: `PascalCase.tsx` (e.g., `AccountCard.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`)
- Services: `*.service.ts`
- Types: `*.types.ts`
- Utils: `camelCase.ts`

---

### Import Patterns

**Backend:**

```typescript
// External libraries first
import { Request, Response } from 'express';
import { z } from 'zod';

// Internal modules
import * as authService from '../services/auth.service';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

// Types
import type { AuthRequest } from '../types/express';
```

**Frontend:**

```typescript
// React and React libraries
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Third-party libraries
import { useQuery, useMutation } from '@tanstack/react-query';

// Components
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';

// Hooks and services
import { useAuth } from '@/hooks/useAuth';
import * as accountService from '@/services/account.service';

// Types and utils
import type { Account } from '@/types/account.types';
import { formatCurrency } from '@/utils/format';
```

---

## Architecture Overview

### System Design

Budget Reduction Tracking follows a **layered architecture** pattern:

```
┌─────────────────────────────────────┐
│         Frontend (React)            │
│  - UI Components                    │
│  - State Management (React Query)   │
│  - Client-side Routing              │
└──────────────┬──────────────────────┘
               │ HTTP/REST
               ▼
┌─────────────────────────────────────┐
│      Backend API (Express)          │
│  ┌───────────────────────────────┐  │
│  │  Controllers (HTTP Handlers)  │  │
│  └────────────┬──────────────────┘  │
│               │                      │
│  ┌────────────▼──────────────────┐  │
│  │  Services (Business Logic)    │  │
│  └────────────┬──────────────────┘  │
│               │                      │
│  ┌────────────▼──────────────────┐  │
│  │  Prisma ORM (Data Access)     │  │
│  └────────────┬──────────────────┘  │
└───────────────┼──────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│      PostgreSQL Database            │
│  - User Data                        │
│  - Accounts                         │
│  - Transactions                     │
│  - Snapshots                        │
└─────────────────────────────────────┘
```

---

### Data Flow

**Typical Request Flow:**

1. **User Action**: User clicks "Add Account" button
2. **Frontend Component**: Triggers form submission
3. **React Hook Form**: Validates form data
4. **API Service**: Sends POST request to backend
5. **Backend Route**: Routes to controller
6. **Middleware**: Validates JWT, validates request body
7. **Controller**: Receives request, calls service
8. **Service**: Executes business logic, calls Prisma
9. **Prisma**: Queries/updates database
10. **Database**: Returns data
11. **Service**: Processes and returns data
12. **Controller**: Formats response
13. **API Service**: Receives response
14. **React Query**: Updates cache, triggers re-render
15. **Component**: Displays updated data

---

### Authentication Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. POST /api/auth/login
     │    { email, password }
     ▼
┌─────────────────┐
│  Auth Service   │
├─────────────────┤
│ 2. Verify       │
│    password     │
│ 3. Generate JWT │
└────┬────────────┘
     │
     │ 4. Return tokens
     │    { accessToken, refreshToken }
     ▼
┌─────────────────┐
│   Frontend      │
├─────────────────┤
│ 5. Store tokens │
│    in memory    │
└────┬────────────┘
     │
     │ 6. Subsequent requests
     │    Authorization: Bearer <token>
     ▼
┌─────────────────┐
│  Auth Middleware│
├─────────────────┤
│ 7. Verify JWT   │
│ 8. Attach user  │
│    to request   │
└────┬────────────┘
     │
     │ 9. Request proceeds
     ▼
┌─────────────────┐
│   Controller    │
└─────────────────┘
```

---

### State Management

**Frontend State:**

1. **Server State** (React Query):
   - User data
   - Accounts
   - Transactions
   - Analytics

2. **Client State** (React Context):
   - Authentication status
   - User session
   - Current user

3. **Component State** (useState):
   - Form inputs
   - Modal visibility
   - UI toggles

**Backend State:**

- **Stateless**: Each request is independent
- **JWT**: Carries user identity
- **Database**: Source of truth for all data

---

## Coding Standards

### TypeScript Guidelines

**1. Always Use Types**

```typescript
// ❌ Bad
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Good
interface Item {
  price: number;
  quantity: number;
}

function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

**2. Use Interfaces for Objects**

```typescript
// ✅ Good
interface Account {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
}
```

**3. Use Type for Unions and Primitives**

```typescript
// ✅ Good
type AccountType = 'CREDIT_CARD' | 'PERSONAL_LOAN' | 'AUTO_LOAN';
type TransactionType = 'PAYMENT' | 'CHARGE' | 'ADJUSTMENT';
```

**4. Avoid `any`**

```typescript
// ❌ Bad
const data: any = fetchData();

// ✅ Good
interface ApiResponse {
  success: boolean;
  data: Account[];
}

const data: ApiResponse = await fetchData();
```

---

### React Best Practices

**1. Functional Components**

```typescript
// ✅ Good
export const AccountCard: React.FC<{ account: Account }> = ({ account }) => {
  return (
    <div className="account-card">
      <h3>{account.name}</h3>
      <p>{formatCurrency(account.balance)}</p>
    </div>
  );
};
```

**2. Custom Hooks for Logic**

```typescript
// ✅ Good
export const useAccounts = () => {
  const query = useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.getAll,
  });

  return {
    accounts: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};
```

**3. Memoization When Needed**

```typescript
// ✅ Good
const MemoizedChart = React.memo(({ data }) => {
  return <LineChart data={data} />;
});
```

---

### API Design Patterns

**1. RESTful Endpoints**

```typescript
// ✅ Good
GET    /api/accounts           // List all accounts
GET    /api/accounts/:id       // Get one account
POST   /api/accounts           // Create account
PUT    /api/accounts/:id       // Update account
DELETE /api/accounts/:id       // Delete account
```

**2. Consistent Response Format**

```typescript
// ✅ Good
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
}
```

**3. Validation with Zod**

```typescript
// ✅ Good
const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  accountType: z.enum(['CREDIT_CARD', 'PERSONAL_LOAN', ...]),
  currentBalance: z.number().min(0),
  interestRate: z.number().min(0).max(100),
});
```

---

### Database Patterns

**1. Use Prisma for All Queries**

```typescript
// ✅ Good
const accounts = await prisma.account.findMany({
  where: {
    userId,
    isActive: true,
  },
  include: {
    transactions: true,
  },
});
```

**2. Use Transactions for Multi-Step Operations**

```typescript
// ✅ Good
await prisma.$transaction(async (tx) => {
  await tx.transaction.create({ data: transactionData });
  await tx.account.update({
    where: { id: accountId },
    data: { currentBalance: newBalance },
  });
});
```

**3. Index Important Fields**

```prisma
// ✅ Good
model Account {
  id     String @id @default(uuid())
  userId String

  @@index([userId])
  @@index([accountType])
}
```

---

### Error Handling Conventions

**Backend:**

```typescript
// ✅ Good
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: Record<string, string>
  ) {
    super(message);
  }
}

// Usage
if (!account) {
  throw new AppError(404, 'Account not found');
}
```

**Frontend:**

```typescript
// ✅ Good
try {
  await accountService.create(data);
  toast.success('Account created successfully');
} catch (error) {
  toast.error(error.message || 'Failed to create account');
}
```

---

### Logging Standards

**Use Winston for Backend Logging:**

```typescript
import { logger } from '../utils/logger.util';

// ✅ Good
logger.info('User logged in', { userId: user.id });
logger.warn('Invalid login attempt', { email });
logger.error('Database connection failed', { error });
```

**Log Levels:**
- **error**: Errors that need immediate attention
- **warn**: Warning messages
- **info**: General information
- **debug**: Detailed debugging information (development only)

---

## Git Workflow

### Branch Naming

```bash
# Feature branches
feature/add-account-sorting
feature/implement-interest-calculator

# Bug fixes
fix/balance-calculation-error
fix/login-redirect-issue

# Hotfixes
hotfix/security-vulnerability
hotfix/critical-data-loss

# Documentation
docs/update-api-documentation
docs/add-user-guide

# Refactoring
refactor/simplify-auth-logic
refactor/optimize-database-queries
```

---

### Commit Message Format

Follow **Conventional Commits** specification:

```bash
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi-colons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(accounts): add ability to sort accounts by balance

fix(analytics): correct interest calculation formula

docs(api): update authentication endpoint documentation

refactor(services): simplify transaction service logic

test(controllers): add tests for account controller
```

---

### Pull Request Process

**1. Create Feature Branch**

```bash
git checkout -b feature/add-account-filtering
```

**2. Make Changes and Commit**

```bash
git add .
git commit -m "feat(accounts): add filtering by account type"
```

**3. Push to Remote**

```bash
git push origin feature/add-account-filtering
```

**4. Create Pull Request**

- Title: Clear description of changes
- Description: Detailed explanation of what and why
- Link related issues
- Add screenshots for UI changes

**5. Code Review**

- Request review from team members
- Address feedback
- Make requested changes

**6. Merge**

- Squash and merge (preferred)
- Or merge commit
- Delete branch after merge

---

### Code Review Checklist

**Reviewer Should Check:**

- [ ] Code follows project conventions
- [ ] No console.logs or debug code
- [ ] Proper error handling
- [ ] TypeScript types are correct
- [ ] No security vulnerabilities
- [ ] Tests are included (if applicable)
- [ ] Documentation updated (if needed)
- [ ] Performance considerations addressed
- [ ] No breaking changes (or documented)

---

## Adding New Features

### Creating New Endpoints

**1. Define Schema (Prisma)**

```prisma
// prisma/schema.prisma
model NewFeature {
  id        String   @id @default(uuid())
  userId    String
  name      String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

**2. Create Migration**

```bash
npx prisma migrate dev --name add-new-feature
```

**3. Create Validator**

```typescript
// src/validators/newFeature.validator.ts
import { z } from 'zod';

export const createNewFeatureSchema = z.object({
  name: z.string().min(1).max(100),
});
```

**4. Create Service**

```typescript
// src/services/newFeature.service.ts
import { prisma } from '../config/database';

export const create = async (userId: string, data: any) => {
  return await prisma.newFeature.create({
    data: { ...data, userId },
  });
};
```

**5. Create Controller**

```typescript
// src/controllers/newFeature.controller.ts
import * as newFeatureService from '../services/newFeature.service';

export const create = async (req: Request, res: Response) => {
  const result = await newFeatureService.create(req.user.id, req.body);
  res.status(201).json({ success: true, data: result });
};
```

**6. Create Routes**

```typescript
// src/routes/newFeature.routes.ts
import { Router } from 'express';
import * as controller from '../controllers/newFeature.controller';

const router = Router();
router.use(requireAuth);
router.post('/', validate(createNewFeatureSchema), controller.create);

export default router;
```

**7. Register Routes**

```typescript
// src/index.ts
import newFeatureRoutes from './routes/newFeature.routes';

app.use('/api/new-features', newFeatureRoutes);
```

---

### Adding New Components

**1. Create Component File**

```typescript
// src/components/newFeature/NewFeatureCard.tsx
import React from 'react';
import { Card } from '@/components/common/Card';

interface Props {
  data: NewFeature;
}

export const NewFeatureCard: React.FC<Props> = ({ data }) => {
  return (
    <Card>
      <h3>{data.name}</h3>
    </Card>
  );
};
```

**2. Create Hook**

```typescript
// src/hooks/useNewFeature.ts
import { useQuery } from '@tanstack/react-query';
import * as newFeatureService from '@/services/newFeature.service';

export const useNewFeatures = () => {
  return useQuery({
    queryKey: ['newFeatures'],
    queryFn: newFeatureService.getAll,
  });
};
```

**3. Create Service**

```typescript
// src/services/newFeature.service.ts
import { api } from './api';

export const getAll = async () => {
  const { data } = await api.get('/new-features');
  return data.data;
};
```

**4. Use in Page**

```typescript
// src/pages/NewFeature.tsx
import { useNewFeatures } from '@/hooks/useNewFeature';
import { NewFeatureCard } from '@/components/newFeature/NewFeatureCard';

export const NewFeaturePage = () => {
  const { data, isLoading } = useNewFeatures();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {data?.map(item => (
        <NewFeatureCard key={item.id} data={item} />
      ))}
    </div>
  );
};
```

---

### Database Schema Changes

**Adding a Field:**

```bash
# 1. Update schema.prisma
# 2. Create migration
npx prisma migrate dev --name add-field-to-table

# 3. Generate Prisma Client
npx prisma generate
```

**Modifying a Field:**

```bash
# Be careful - may lose data
npx prisma migrate dev --name modify-field-type
```

**Best Practice:**

- Always review generated SQL before applying
- Test migrations on development database first
- Backup production database before applying migrations

---

## Debugging

### Backend Debugging

**Using VS Code:**

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

**Set Breakpoints:**
- Click left gutter in VS Code
- Run "Debug Backend" from debug panel

**Console Debugging:**

```typescript
// Add debug logs
console.log('Account data:', account);
console.log('User ID:', req.user.id);

// Use debugger statement
debugger;
```

---

### Frontend Debugging

**React DevTools:**

1. Install React DevTools browser extension
2. Open browser dev tools
3. Use Components tab to inspect component tree
4. Use Profiler tab for performance analysis

**Redux DevTools (React Query):**

React Query Devtools are already installed:

```typescript
// Automatically available in development
// Look for React Query icon in bottom-right
```

**Console Debugging:**

```typescript
console.log('Account data:', account);
console.log('Form values:', form.getValues());

// Debug renders
useEffect(() => {
  console.log('Component rendered', { props, state });
});
```

---

### Database Debugging

**Prisma Studio:**

```bash
cd backend
npm run prisma:studio
```

Open `http://localhost:5555` to:
- View all database records
- Edit data manually
- Test queries

**SQL Logging:**

```typescript
// Enable in schema.prisma
generator client {
  provider = "prisma-client-js"
  log      = ["query", "info", "warn", "error"]
}
```

**Direct SQL:**

```bash
# Connect to database
psql postgresql://user:password@localhost:5432/budget_tracking

# Run queries
SELECT * FROM "Account" WHERE "userId" = 'uuid-here';
```

---

### Common Issues and Solutions

**Issue: Port Already in Use**

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
```

**Issue: Database Connection Failed**

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Start if needed
sudo systemctl start postgresql
```

**Issue: Prisma Client Out of Sync**

```bash
# Regenerate Prisma Client
npx prisma generate
```

**Issue: CORS Errors**

```typescript
// Check CORS_ORIGIN in backend .env matches frontend URL
CORS_ORIGIN=http://localhost:5173
```

---

## Testing

### Backend Testing

**Unit Tests:**

```typescript
// tests/services/account.service.test.ts
import { createAccount } from '../src/services/account.service';

describe('Account Service', () => {
  it('should create an account', async () => {
    const account = await createAccount(userId, accountData);
    expect(account).toHaveProperty('id');
    expect(account.name).toBe(accountData.name);
  });
});
```

**Running Tests:**

```bash
cd backend
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

---

### Frontend Testing

**Component Tests:**

```typescript
// tests/components/AccountCard.test.tsx
import { render, screen } from '@testing-library/react';
import { AccountCard } from '../src/components/accounts/AccountCard';

describe('AccountCard', () => {
  it('renders account name', () => {
    render(<AccountCard account={mockAccount} />);
    expect(screen.getByText('Chase Freedom')).toBeInTheDocument();
  });
});
```

**Running Tests:**

```bash
cd frontend
npm test
```

---

## Performance

### Frontend Optimization

**1. Code Splitting:**

```typescript
// Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Accounts = lazy(() => import('./pages/Accounts'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<Dashboard />} />
  </Routes>
</Suspense>
```

**2. Memoization:**

```typescript
// Memoize expensive calculations
const totalDebt = useMemo(() => {
  return accounts.reduce((sum, acc) => sum + acc.balance, 0);
}, [accounts]);

// Memoize components
const MemoizedChart = React.memo(ChartComponent);
```

**3. Virtual Scrolling:**

For large lists of transactions, consider using `react-window` or `react-virtual`.

---

### Backend Optimization

**1. Database Indexes:**

```prisma
model Account {
  @@index([userId])
  @@index([accountType])
  @@index([createdAt])
}
```

**2. Query Optimization:**

```typescript
// ❌ Bad - N+1 query
const accounts = await prisma.account.findMany();
for (const account of accounts) {
  const transactions = await prisma.transaction.findMany({
    where: { accountId: account.id }
  });
}

// ✅ Good - Single query with include
const accounts = await prisma.account.findMany({
  include: {
    transactions: true
  }
});
```

**3. Connection Pooling:**

Prisma handles this automatically, but you can configure:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/db?connection_limit=10"
```

---

## Security

### Best Practices

**1. Never Commit Secrets**

```bash
# Add to .gitignore
.env
.env.local
*.key
*.pem
```

**2. Validate All Input**

```typescript
// Use Zod for validation
const schema = z.object({
  email: z.string().email(),
  amount: z.number().min(0),
});
```

**3. Sanitize User Input**

```typescript
// Prisma automatically prevents SQL injection
// But still validate and sanitize

import { escape } from 'html-escaper';
const sanitized = escape(userInput);
```

**4. Use HTTPS in Production**

```typescript
// Enforce HTTPS
app.use((req, res, next) => {
  if (!req.secure && process.env.NODE_ENV === 'production') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});
```

**5. Rate Limiting**

Already implemented in the project:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

**6. Security Headers**

Already implemented using Helmet:

```typescript
import helmet from 'helmet';
app.use(helmet());
```

---

## Conclusion

This development guide provides the foundation for contributing to Budget Reduction Tracking. For specific implementation details, refer to:

- [API Documentation](./API.md)
- [Database Documentation](./DATABASE.md)
- [Component Documentation](./COMPONENTS.md)
- [Architecture Document](../ARCHITECTURE.md)

**Happy coding!** 🚀

---

**Last Updated**: 2025-11-23
