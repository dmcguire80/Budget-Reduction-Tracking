# Backend - Budget Reduction Tracking

Node.js + Express + TypeScript + Prisma backend for Budget Reduction Tracking.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Deployment](#deployment)

## Tech Stack

- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Winston
- **Password Hashing**: bcrypt

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 20 or higher
- npm 10 or higher
- PostgreSQL 16 or higher

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment template:
```bash
cp .env.example .env
```

4. Configure your `.env` file (see [Environment Variables](#environment-variables))

5. Generate Prisma Client:
```bash
npm run prisma:generate
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Application
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/budget_tracking

# JWT Secrets (use strong random strings in production)
JWT_SECRET=your-jwt-secret-min-32-characters
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret-min-32-characters
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Password Hashing
BCRYPT_ROUNDS=12
```

### Important Notes:

- **JWT_SECRET** and **REFRESH_TOKEN_SECRET** must be at least 32 characters long
- Use `openssl rand -base64 32` to generate secure secrets
- Never commit the `.env` file to version control

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE budget_tracking;

# Create user (optional)
CREATE USER budget_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE budget_tracking TO budget_user;

# Exit psql
\q
```

### 2. Run Migrations

```bash
# Run database migrations
npm run migrate

# Or for production
npm run migrate:deploy
```

### 3. Seed Database (Development Only)

```bash
npm run seed
```

This creates a demo user and sample data:
- **Email**: demo@example.com
- **Password**: demo123

## Available Scripts

### Development

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Database

```bash
# Create and apply a new migration
npm run migrate

# Apply migrations in production
npm run migrate:deploy

# Generate Prisma Client
npm run prisma:generate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Reset database (WARNING: deletes all data)
npm run prisma:reset

# Seed database with sample data
npm run seed
```

### Code Quality

```bash
# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm test
```

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts   # Prisma client singleton
│   │   └── index.ts      # Environment variables validation
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   │   ├── errorHandler.ts    # Global error handling
│   │   └── requestLogger.ts   # Request logging
│   ├── routes/          # API routes
│   │   └── health.ts    # Health check endpoint
│   ├── services/        # Business logic layer
│   ├── utils/           # Utility functions
│   │   └── logger.ts    # Winston logger configuration
│   ├── types/           # TypeScript type definitions
│   ├── validators/      # Zod validation schemas
│   └── index.ts         # Application entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── seed.ts          # Database seeding script
│   └── migrations/      # Database migrations
├── dist/                # Compiled JavaScript (generated)
├── logs/                # Application logs (generated in production)
├── package.json
├── tsconfig.json
└── .env                 # Environment variables (not in git)
```

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

The server will start on http://localhost:3001 with hot reload enabled.

### 2. Check Health Endpoint

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-23T12:00:00.000Z",
  "database": "connected",
  "uptime": 10.5
}
```

### 3. Database Changes

When modifying the schema:

```bash
# 1. Update prisma/schema.prisma

# 2. Create migration
npm run migrate

# 3. Prisma Client is automatically regenerated
```

### 4. View Database

```bash
npm run prisma:studio
```

Opens Prisma Studio at http://localhost:5555

## API Endpoints

### Health Check

- `GET /health` - Server health check

### Authentication (Coming in Agent 3)

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Accounts (Coming in Agent 4)

- `GET /api/accounts` - List all accounts
- `GET /api/accounts/:id` - Get account details
- `POST /api/accounts` - Create new account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

### Transactions (Coming in Agent 4)

- `GET /api/accounts/:id/transactions` - List transactions
- `POST /api/accounts/:id/transactions` - Add transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Snapshots (Coming in Agent 4)

- `GET /api/accounts/:id/snapshots` - Get snapshots
- `POST /api/accounts/:id/snapshots` - Create snapshot
- `GET /api/accounts/:id/snapshots/chart-data` - Get chart data

### Analytics (Coming in Agent 5)

- `GET /api/analytics/overview` - Debt reduction overview
- `GET /api/analytics/projections` - Debt payoff projections
- `GET /api/analytics/interest-forecast` - Interest forecast

## Database Schema

### Models

- **User**: User accounts with authentication
- **Account**: Debt/credit accounts (credit cards, loans, etc.)
- **Transaction**: Financial transactions (payments, charges)
- **Snapshot**: Historical balance snapshots for tracking

### Account Types

- `CREDIT_CARD`
- `PERSONAL_LOAN`
- `AUTO_LOAN`
- `MORTGAGE`
- `STUDENT_LOAN`
- `OTHER`

### Transaction Types

- `PAYMENT` - Money paid toward balance
- `CHARGE` - New charges/purchases
- `ADJUSTMENT` - Manual adjustments
- `INTEREST` - Interest charges

## Features

### Implemented

- Express server with TypeScript
- Prisma ORM with PostgreSQL
- Environment variable validation
- Winston logging
- Request logging middleware
- Global error handling
- Health check endpoint
- Database connection management
- Graceful shutdown
- Security middleware (Helmet, CORS)
- Rate limiting
- Database seeding

### Coming Soon (Other Agents)

- JWT authentication (Agent 3)
- User registration/login (Agent 3)
- CRUD operations for accounts (Agent 4)
- Transaction management (Agent 4)
- Snapshot tracking (Agent 4)
- Analytics and projections (Agent 5)

## Testing

```bash
npm test
```

Tests coming soon in future agent work.

## Deployment

### Production Build

```bash
# Build application
npm run build

# Run migrations
npm run migrate:deploy

# Start production server
npm start
```

### Environment

Ensure production `.env` has:
- `NODE_ENV=production`
- Strong JWT secrets
- Proper database URL
- Correct CORS origin

### Monitoring

Logs are stored in `logs/` directory:
- `logs/error.log` - Error logs only
- `logs/combined.log` - All logs

Monitor with:
```bash
tail -f logs/combined.log
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
systemctl status postgresql

# Test connection
psql -U postgres -d budget_tracking
```

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Prisma Client Not Generated

```bash
npm run prisma:generate
```

## Agents Working Here

- **Agent 2**: Database & Backend Core Engineer (CURRENT)
- **Agent 3**: Authentication & Authorization Engineer
- **Agent 4**: API Endpoints Engineer
- **Agent 5**: Analytics & Calculations Engineer

## License

MIT

## Support

For issues or questions, please refer to the main [README.md](../README.md) or open an issue on GitHub.
