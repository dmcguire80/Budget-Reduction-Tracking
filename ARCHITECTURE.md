# Budget Reduction Tracking - System Architecture

## Overview

Budget Reduction Tracking is a web application designed to monitor and visualize debt/credit reduction progress over time. The application provides detailed account management, progress tracking, and predictive analytics for debt payoff strategies.

## System Design Philosophy

- **Data Integrity**: Financial data requires ACID-compliant database
- **Real-time Updates**: Dashboard reflects immediate changes
- **Scalability**: Containerized deployment for easy scaling in Proxmox cluster
- **User Experience**: Inverted visualization where reduction = positive progress
- **Predictive Analytics**: Interest calculation and trend analysis

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: React Context API + React Query for server state
- **Charting**: Chart.js with react-chartjs-2
- **UI Framework**: Material-UI (MUI) or Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod for request validation
- **ORM**: Prisma
- **Security**: Helmet, CORS, rate limiting

### Database
- **Primary Database**: PostgreSQL 16
- **Migrations**: Prisma Migrate
- **Backup Strategy**: Automated daily backups

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **SSL/TLS**: Let's Encrypt (Certbot)
- **Deployment Platform**: Proxmox VE
- **CI/CD**: GitHub Actions (optional)
- **Monitoring**: Optional Prometheus + Grafana

## Architecture Patterns

### Frontend Architecture
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (buttons, inputs)
│   ├── accounts/       # Account-specific components
│   ├── charts/         # Chart components
│   └── layout/         # Layout components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── context/            # React context providers
└── config/             # Configuration files
```

### Backend Architecture
```
src/
├── controllers/        # Request handlers
├── services/           # Business logic layer
├── models/            # Data models (Prisma)
├── middleware/        # Express middleware
├── routes/            # API route definitions
├── utils/             # Utility functions
├── validators/        # Request validation schemas
├── config/            # Configuration management
└── types/             # TypeScript type definitions
```

## Data Model

### Core Entities

#### User
```typescript
{
  id: string (UUID)
  email: string (unique)
  passwordHash: string
  name: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Account
```typescript
{
  id: string (UUID)
  userId: string (foreign key)
  name: string
  accountType: enum (CREDIT_CARD, PERSONAL_LOAN, AUTO_LOAN, MORTGAGE, STUDENT_LOAN, OTHER)
  currentBalance: decimal
  creditLimit: decimal (nullable)
  interestRate: decimal (APR as percentage)
  minimumPayment: decimal (nullable)
  dueDay: integer (day of month, nullable)
  isActive: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Transaction
```typescript
{
  id: string (UUID)
  accountId: string (foreign key)
  amount: decimal (negative for payments)
  transactionType: enum (PAYMENT, CHARGE, ADJUSTMENT, INTEREST)
  transactionDate: DateTime
  description: string (nullable)
  createdAt: DateTime
}
```

#### Snapshot
```typescript
{
  id: string (UUID)
  accountId: string (foreign key)
  balance: decimal
  snapshotDate: DateTime
  note: string (nullable)
  createdAt: DateTime
}
```

## API Design

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Account Endpoints
- `GET /api/accounts` - List all user accounts
- `GET /api/accounts/:id` - Get account details
- `POST /api/accounts` - Create new account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account
- `GET /api/accounts/:id/summary` - Get account summary with analytics

### Transaction Endpoints
- `GET /api/accounts/:id/transactions` - List account transactions
- `POST /api/accounts/:id/transactions` - Add transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Snapshot Endpoints
- `GET /api/accounts/:id/snapshots` - Get historical snapshots
- `POST /api/accounts/:id/snapshots` - Create manual snapshot
- `GET /api/accounts/:id/snapshots/chart-data` - Get formatted chart data

### Analytics Endpoints
- `GET /api/analytics/overview` - Overall debt reduction overview
- `GET /api/analytics/projections` - Debt payoff projections
- `GET /api/analytics/interest-forecast` - Interest cost forecast

## Key Features

### 1. Account Management
- Add/edit/delete credit accounts
- Track: balance, limit, interest rate, type
- Support multiple account types
- Active/inactive account status

### 2. Progress Visualization
- **Inverted Chart Logic**: Decreasing balance = upward trend
- Line charts showing balance reduction over time
- Multiple accounts on single chart
- Color coding by account type
- Date range filtering

### 3. Predictive Analytics
- Interest accumulation calculator
- Payoff timeline projection based on payment trends
- "What-if" scenarios for different payment amounts
- Total interest savings visualization

### 4. Data Entry
- Manual balance updates
- Transaction logging (payments, charges)
- Automated snapshot creation
- CSV import capability (nice-to-have)

### 5. Dashboard Features
- Total debt reduction summary
- Progress percentage
- Interest saved vs. paid
- Monthly payment tracking
- Goal setting and tracking

## Chart Implementation

### Primary Chart: Balance Reduction Timeline

**Chart Configuration**:
- Type: Line chart
- Y-axis: Balance amount (inverted scale or calculated reduction)
- X-axis: Time
- Dataset per account
- Visual indicators: payments, milestones

**Inversion Strategy**:
```javascript
// Option 1: Display reduction amount instead of balance
const reductionAmount = initialBalance - currentBalance;

// Option 2: Reverse Y-axis scale
const yAxisConfig = {
  reverse: false,
  ticks: {
    callback: (value) => `$${initialBalance - value}`
  }
};
```

### Secondary Charts:
- Interest accumulation over time
- Payment distribution (pie chart)
- Projected vs. actual reduction
- Month-over-month reduction rate

## Interest Calculation

### Simple Interest Calculation
```typescript
// Daily interest accumulation
const dailyRate = annualRate / 365;
const dailyInterest = balance * dailyRate;
const monthlyInterest = dailyInterest * 30; // approximate
```

### Projection Algorithm
```typescript
function calculatePayoffProjection(
  balance: number,
  interestRate: number,
  monthlyPayment: number
) {
  let projectedBalance = balance;
  let totalInterest = 0;
  let months = 0;
  const monthlyRate = interestRate / 12 / 100;

  while (projectedBalance > 0 && months < 600) { // 50 year max
    const interestCharge = projectedBalance * monthlyRate;
    totalInterest += interestCharge;
    projectedBalance = projectedBalance + interestCharge - monthlyPayment;
    months++;
  }

  return { months, totalInterest, finalBalance: projectedBalance };
}
```

## Security Considerations

### Authentication & Authorization
- JWT-based authentication
- Password hashing with bcrypt (12+ rounds)
- Secure HTTP-only cookies for refresh tokens
- Role-based access control (future)

### Data Protection
- Input validation on all endpoints
- SQL injection prevention (Prisma parameterization)
- XSS protection (React sanitization + CSP headers)
- CORS configuration
- Rate limiting to prevent abuse

### Infrastructure Security
- HTTPS only in production
- Environment variable management
- Secrets management (Docker secrets or .env)
- Database connection encryption
- Regular security updates

## Deployment Architecture

### Docker Compose Structure
```yaml
services:
  frontend:
    - Nginx serving React build
    - Port 80/443

  backend:
    - Node.js Express API
    - Port 3001 (internal)

  database:
    - PostgreSQL 16
    - Port 5432 (internal only)
    - Persistent volume

  nginx-proxy:
    - Reverse proxy
    - SSL termination
    - Load balancing ready
```

### Proxmox Deployment
1. Create LXC container or VM
2. Install Docker and Docker Compose
3. Clone repository
4. Configure environment variables
5. Run `docker-compose up -d`
6. Configure firewall rules
7. Set up SSL certificates
8. Configure backups

## Development Workflow

### Local Development
```bash
# Backend
cd backend
npm install
npm run dev  # Watch mode

# Frontend
cd frontend
npm install
npm run dev  # Vite dev server

# Database
docker-compose up db  # PostgreSQL only
```

### Database Migrations
```bash
# Create migration
npx prisma migrate dev --name description

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

## Performance Considerations

### Frontend Optimization
- Code splitting by route
- Lazy loading for charts
- Memoization for expensive calculations
- Virtual scrolling for large transaction lists
- Debounced search/filter inputs

### Backend Optimization
- Database indexing on foreign keys and query fields
- Connection pooling
- Query optimization with Prisma
- Caching strategy for read-heavy endpoints (Redis - future)
- Pagination for large datasets

### Database Optimization
- Indexes on: userId, accountId, transactionDate
- Materialized views for complex analytics (future)
- Partitioning for historical data (future)
- Regular VACUUM and ANALYZE

## Monitoring & Observability

### Logging
- Structured logging (Winston or Pino)
- Log levels: error, warn, info, debug
- Request/response logging
- Error tracking (Sentry - optional)

### Metrics (Future Enhancement)
- API response times
- Database query performance
- User activity metrics
- System resource usage

## Testing Strategy

### Frontend Testing
- Unit tests: Jest + React Testing Library
- Component tests for UI components
- Integration tests for user flows
- E2E tests: Playwright or Cypress

### Backend Testing
- Unit tests: Jest
- Integration tests with test database
- API endpoint tests with Supertest
- Load testing with Artillery (optional)

### Test Coverage Goals
- Backend: 80%+ coverage
- Frontend: 70%+ coverage
- Critical paths: 100% coverage

## Future Enhancements

### Phase 2 Features
- Multiple user support with sharing
- Mobile responsive design
- Email notifications for due dates
- Budget planning integration
- Debt snowball/avalanche calculator
- Export to PDF/Excel

### Phase 3 Features
- Mobile app (React Native)
- Bank account integration (Plaid API)
- Automated transaction import
- AI-powered insights
- Multi-currency support
- Collaborative debt planning

## Configuration Management

### Environment Variables

**Backend (.env)**
```
NODE_ENV=production|development
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
JWT_SECRET=<strong-secret>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=<strong-secret>
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Budget Reduction Tracker
```

## Conclusion

This architecture provides a solid foundation for a production-ready debt reduction tracking application. The modular design allows for incremental development and easy maintenance. The technology choices balance developer experience, performance, and operational simplicity.

---

**Architecture Version**: 1.0
**Last Updated**: 2025-11-23
**Architect**: Claude (AI Software Architect)
