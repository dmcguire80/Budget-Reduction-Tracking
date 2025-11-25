# Budget Reduction Tracking - Project Summary

**Version:** 1.0.0
**Status:** Production Ready
**Last Updated:** 2025-11-24
**Repository:** https://github.com/dmcguire80/Budget-Reduction-Tracking

---

## Executive Summary

The Budget Reduction Tracking application is a comprehensive full-stack web application designed to help users track and visualize their debt reduction progress over time. Built with modern technologies and best practices, the application provides an intuitive interface for managing multiple debt accounts, recording transactions, and analyzing payoff projections with interest calculations.

### Key Features

- **Account Management**: Track multiple debt accounts (credit cards, loans, mortgages) with individual interest rates and credit limits
- **Transaction Tracking**: Record payments, charges, adjustments, and interest charges with automatic balance updates
- **Visual Analytics**: Interactive charts showing debt reduction as upward progress (inverted visualization)
- **Payoff Projections**: Calculate total interest and time to debt-free status based on payment trends
- **Snapshot System**: Automatic balance tracking for historical analysis
- **Secure Authentication**: JWT-based authentication with refresh tokens
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

---

## Technology Stack

### Backend

| Component | Technology | Version |
|-----------|------------|---------|
| **Runtime** | Node.js | 20 LTS |
| **Framework** | Express.js | 4.18.2 |
| **Language** | TypeScript | 5.3.3 |
| **Database** | PostgreSQL | 16+ |
| **ORM** | Prisma | 5.7.1 |
| **Authentication** | JSON Web Tokens (JWT) | 9.0.2 |
| **Password Hashing** | bcrypt | 5.1.1 |
| **Validation** | Zod | 3.22.4 |
| **Logging** | Winston | 3.11.0 |
| **Security** | Helmet, CORS, Rate Limiting | Latest |
| **Testing** | Jest, Supertest | 30.x, 7.x |

### Frontend

| Component | Technology | Version |
|-----------|------------|---------|
| **Framework** | React | 19.2.0 |
| **Language** | TypeScript | 5.9.3 |
| **Build Tool** | Vite | 7.2.4 |
| **Routing** | React Router | 7.9.6 |
| **State Management** | TanStack Query (React Query) | 5.90.10 |
| **Forms** | React Hook Form | 7.66.1 |
| **Validation** | Zod | 4.1.12 |
| **Styling** | Tailwind CSS | 4.1.17 |
| **Charts** | Chart.js, react-chartjs-2 | 4.5.1, 5.3.1 |
| **HTTP Client** | Axios | 1.13.2 |
| **Date Handling** | date-fns | 4.1.0 |
| **Testing** | Vitest, React Testing Library | 4.x, 16.x |

### Infrastructure

| Component | Technology | Notes |
|-----------|------------|-------|
| **Deployment** | Proxmox LXC Containers | Native services, NOT Docker |
| **Process Manager** | PM2 | Backend process management |
| **Web Server** | Nginx | Frontend static files + reverse proxy |
| **Reverse Proxy** | Nginx Proxy Manager | SSL termination, subdomain routing |
| **DNS/CDN** | Cloudflare | DNS, DDoS protection, caching |
| **Gateway** | UniFi | Port forwarding, firewall |
| **SSL/TLS** | Let's Encrypt | Auto-renewal via NPM |

---

## Architecture Overview

### System Architecture

```
Internet Users
    ↓
Cloudflare (DNS + CDN + Security)
    ↓ (HTTPS Port 443)
Public IP Address
    ↓
UniFi Gateway (Port Forwarding)
    ↓ (Ports 80, 443)
Nginx Proxy Manager LXC (Reverse Proxy + SSL)
    ↓ (HTTP Port 3000)
Budget Tracking App LXC
    ├─ Nginx (Frontend: Port 3000)
    ├─ PM2 → Node.js (Backend API: Port 3001)
    └─ PostgreSQL 16 (Database: Port 5432)
```

### Application Architecture

**Backend (Layered Architecture)**

```
Routes → Controllers → Services → Database
   ↓         ↓            ↓          ↓
Express  Validation  Business   Prisma ORM
         Zod        Logic      PostgreSQL
```

**Frontend (Component-Based Architecture)**

```
Pages → Components → Hooks → Services → API
  ↓         ↓         ↓         ↓        ↓
Router   Reusable  Custom   HTTP    Backend
        UI Parts  Logic   Client   Axios
```

---

## Database Schema

### Core Models

#### User
```prisma
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String
  name         String
  createdAt    DateTime  @default(now())
  accounts     Account[]
}
```

#### Account
```prisma
model Account {
  id             String      @id @default(uuid())
  userId         String
  name           String
  accountType    AccountType
  currentBalance Decimal     @db.Decimal(12, 2)
  creditLimit    Decimal?    @db.Decimal(12, 2)
  interestRate   Decimal     @db.Decimal(5, 2)
  createdAt      DateTime    @default(now())
  transactions   Transaction[]
  snapshots      Snapshot[]
}
```

**Account Types:**
- `CREDIT_CARD`
- `PERSONAL_LOAN`
- `AUTO_LOAN`
- `MORTGAGE`
- `STUDENT_LOAN`
- `OTHER`

#### Transaction
```prisma
model Transaction {
  id              String          @id @default(uuid())
  accountId       String
  amount          Decimal         @db.Decimal(12, 2)
  transactionType TransactionType
  transactionDate DateTime
  description     String?
  createdAt       DateTime        @default(now())
}
```

**Transaction Types:**
- `PAYMENT` - Reduces balance
- `CHARGE` - Increases balance
- `ADJUSTMENT` - Manual correction
- `INTEREST` - Interest charges

#### Snapshot
```prisma
model Snapshot {
  id           String   @id @default(uuid())
  accountId    String
  balance      Decimal  @db.Decimal(12, 2)
  snapshotDate DateTime
  createdAt    DateTime @default(now())
}
```

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/refresh` | Refresh access token | Refresh Token |
| POST | `/api/auth/logout` | User logout | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

### Account Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/accounts` | List all accounts | Yes |
| GET | `/api/accounts/stats` | Get account statistics | Yes |
| GET | `/api/accounts/summary` | Get financial summary | Yes |
| GET | `/api/accounts/:id` | Get account details | Yes |
| POST | `/api/accounts` | Create new account | Yes |
| PUT | `/api/accounts/:id` | Update account | Yes |
| DELETE | `/api/accounts/:id` | Delete account | Yes |

### Transaction Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/accounts/:id/transactions` | List transactions | Yes |
| GET | `/api/accounts/:id/transactions/summary` | Transaction summary | Yes |
| GET | `/api/transactions/:id` | Get transaction details | Yes |
| POST | `/api/accounts/:id/transactions` | Create transaction | Yes |
| PUT | `/api/transactions/:id` | Update transaction | Yes |
| DELETE | `/api/transactions/:id` | Delete transaction | Yes |

### Snapshot Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/accounts/:id/snapshots` | Get snapshots | Yes |
| GET | `/api/accounts/:id/snapshots/chart-data` | Get chart data | Yes |
| POST | `/api/accounts/:id/snapshots` | Create snapshot | Yes |

### Analytics Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/overview` | Dashboard overview | Yes |
| GET | `/api/analytics/debt-reduction` | Debt reduction data | Yes |
| GET | `/api/analytics/interest-analysis` | Interest analysis | Yes |
| GET | `/api/analytics/projection` | Payoff projection | Yes |

### Utility Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |

**Total Endpoints:** 43

---

## Key Features Implementation

### 1. Inverted Visualization Strategy

Charts display debt reduction as **upward progress** instead of downward balance:

```typescript
// Plot reduction amount instead of balance
const chartData = {
  labels: data.labels,
  datasets: data.datasets.map(dataset => ({
    ...dataset,
    data: dataset.data.map(balance =>
      dataset.initialBalance - balance  // Inverted!
    )
  }))
};
```

**Result:** Users see motivating upward trends as they pay down debt.

### 2. Compound Interest Calculations

Accurate payoff projections using compound interest formula:

```typescript
function calculatePayoffProjection(
  currentBalance: number,
  annualRate: number,
  monthlyPayment: number
): PayoffProjection {
  let balance = currentBalance;
  let totalInterest = 0;
  const monthlyRate = annualRate / 12 / 100;

  while (balance > 0 && months < 600) {
    const interestCharged = balance * monthlyRate;
    totalInterest += interestCharged;
    balance = balance + interestCharged - monthlyPayment;
    months++;
  }

  return { months, totalInterest, projectedDate };
}
```

### 3. Automatic Snapshot Creation

Snapshots are automatically created on balance changes using Prisma transactions:

```typescript
await prisma.$transaction(async (tx) => {
  // Update account balance
  await tx.account.update({
    where: { id: accountId },
    data: { currentBalance: newBalance }
  });

  // Create transaction
  await tx.transaction.create({ data: transactionData });

  // Create snapshot
  await tx.snapshot.create({
    data: { accountId, balance: newBalance, snapshotDate: new Date() }
  });
});
```

**Result:** Atomic operations ensure data consistency with automatic rollback on errors.

### 4. JWT Authentication Flow

Secure authentication with access and refresh tokens:

```typescript
// Access Token: 15 minutes (short-lived)
// Refresh Token: 7 days (long-lived)

// Frontend automatically refreshes on 401
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await refreshToken();
      return axios.request(error.config);
    }
  }
);
```

### 5. React Query Optimistic Updates

Instant UI updates with background synchronization:

```typescript
const { mutate } = useMutation({
  mutationFn: createTransaction,
  onMutate: async (newTransaction) => {
    // Optimistically update UI
    queryClient.setQueryData(['transactions'], (old) =>
      [...old, newTransaction]
    );
  },
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries(['transactions']);
    queryClient.invalidateQueries(['accounts']);
  }
});
```

---

## Project Structure

```
Budget-Reduction-Tracking/
├── backend/                    # Node.js + Express backend
│   ├── src/
│   │   ├── __tests__/         # Test files
│   │   ├── config/            # Configuration
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utility functions
│   │   ├── types/             # TypeScript types
│   │   ├── validators/        # Zod schemas
│   │   └── index.ts           # Entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── seed.ts            # Database seeding
│   │   └── migrations/        # Database migrations
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── common/        # Reusable UI
│   │   │   ├── layout/        # Layout components
│   │   │   ├── accounts/      # Account components
│   │   │   ├── transactions/  # Transaction components
│   │   │   ├── charts/        # Chart components
│   │   │   └── auth/          # Auth components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API services
│   │   ├── context/           # React context
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utility functions
│   │   ├── validators/        # Zod schemas
│   │   ├── config/            # Configuration
│   │   ├── test/              # Test setup
│   │   └── main.tsx           # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   └── tailwind.config.js
│
├── lxc/                        # LXC deployment scripts
│   ├── setup-lxc.sh           # LXC container setup
│   ├── nginx-site.conf        # Nginx configuration
│   └── pm2-ecosystem.config.js # PM2 configuration
│
├── scripts/                    # Utility scripts
│   ├── deploy-lxc.sh          # Deployment script
│   ├── backup-database.sh     # Database backup
│   └── check-env.sh           # Environment validation
│
├── docs/                       # Documentation
│   ├── API.md                 # API reference
│   ├── DATABASE.md            # Database documentation
│   ├── COMPONENTS.md          # Component library
│   ├── DEVELOPMENT.md         # Developer guide
│   ├── USER_GUIDE.md          # User documentation
│   ├── TESTING.md             # Testing guide
│   ├── DEPLOYMENT.md          # Deployment guide
│   ├── DEPLOYMENT_CHECKLIST.md # Deployment checklist
│   └── EXTERNAL_ACCESS.md     # External access setup
│
├── ARCHITECTURE.md             # System architecture
├── AGENTS.md                   # Agent task delegation
├── README.md                   # Project overview
├── CONTRIBUTING.md             # Contribution guidelines
├── CHANGELOG.md                # Version history
├── QUICK_START.md              # Quick start guide
├── PROJECT_SUMMARY.md          # This file
└── LICENSE                     # MIT License
```

---

## Testing Strategy

### Backend Testing

- **Framework:** Jest with ts-jest
- **Coverage Target:** 80%
- **Test Types:**
  - Unit tests for services and utilities
  - Integration tests for API endpoints
  - Database tests with test database isolation

**Running Tests:**
```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

### Frontend Testing

- **Framework:** Vitest with React Testing Library
- **Coverage Target:** 70%
- **Test Types:**
  - Component tests
  - Hook tests
  - Utility function tests

**Running Tests:**
```bash
cd frontend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
npm run test:ui       # UI mode
```

---

## Deployment

### Production Deployment (Proxmox LXC)

The application deploys to **Proxmox LXC containers** using native services:

1. **Create LXC Container** on Proxmox
2. **Run Setup Script** (`lxc/setup-lxc.sh`)
3. **Configure Database** (PostgreSQL 16)
4. **Clone Repository** to `/opt/budget-tracking`
5. **Configure Environment** (`.env` files)
6. **Run Database Migrations** (Prisma)
7. **Build Applications** (TypeScript → JavaScript, React → Static)
8. **Configure PM2** (Backend process management)
9. **Configure Nginx** (Frontend + Reverse proxy)
10. **Configure NPM** (SSL + External access)

**Complete Checklist:** See `docs/DEPLOYMENT_CHECKLIST.md`

### External Access Stack

```
Internet → Cloudflare → UniFi Gateway → NPM → App LXC
          (DNS/CDN)    (Firewall)     (SSL)  (App)
```

**Configuration Guide:** See `docs/EXTERNAL_ACCESS.md`

---

## Development Workflow

### Local Development Setup

**Prerequisites:**
- Node.js 20 LTS
- PostgreSQL 16
- npm 10+

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with database URL and secrets
npx prisma migrate dev
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with API URL
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- API Health: http://localhost:3001/health

### Git Workflow

1. Create feature branch: `git checkout -b feature/name`
2. Make changes
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Commit changes: `git commit -m "feat: description"`
6. Push branch: `git push origin feature/name`
7. Create pull request
8. Merge to main after review

---

## Agent-Based Development

This project was developed using an AI agent-based approach with 14 specialized agents:

### Phase 1: Foundation (Agents 1-3, 6-7)
- Agent 1: LXC Infrastructure & DevOps
- Agent 2: Database & Backend Core
- Agent 3: Authentication & Authorization
- Agent 6: Frontend Core & Setup
- Agent 7: Frontend Authentication

### Phase 2: Core Features (Agents 4, 8-9)
- Agent 4: API Endpoints (Accounts, Transactions, Snapshots)
- Agent 8: Frontend Accounts Management
- Agent 9: Frontend Transactions Management

### Phase 3: Analytics & Visualization (Agents 5, 10-11)
- Agent 5: Analytics & Interest Calculations
- Agent 10: Charts & Data Visualization
- Agent 11: Dashboard & Overview

### Phase 4: Quality & Integration (Agents 12-14)
- Agent 12: Testing & QA
- Agent 13: Documentation
- Agent 14: Integration & Final Assembly

**Documentation:** See `AGENTS.md` for detailed task breakdowns.

---

## Security Considerations

### Implemented Security Measures

1. **Authentication:**
   - JWT tokens with short expiration (15 min)
   - Refresh token rotation (7 days)
   - Secure password hashing (bcrypt, 12 rounds)

2. **API Security:**
   - Rate limiting (100 req/15 min per IP)
   - CORS configuration
   - Helmet security headers
   - Input validation (Zod)
   - SQL injection protection (Prisma)

3. **Network Security:**
   - HTTPS enforced (Let's Encrypt)
   - Cloudflare DDoS protection
   - UniFi firewall rules
   - Internal network isolation

4. **Data Security:**
   - Passwords never stored in plain text
   - JWT secrets 32+ characters
   - Environment variables for secrets
   - Database user permissions restricted

---

## Performance Optimizations

1. **Frontend:**
   - Code splitting with Vite
   - Lazy loading for routes
   - React Query caching
   - Memoization for expensive calculations
   - Debounced search inputs

2. **Backend:**
   - Database indexing on foreign keys
   - Prisma query optimization
   - Connection pooling
   - Gzip compression

3. **Infrastructure:**
   - Cloudflare CDN caching
   - Nginx static file serving
   - PM2 cluster mode (optional)
   - Database query optimization

---

## Future Enhancements

### Potential Features (v2.0+)

- [ ] **Multi-user support** - Shared accounts and budgets
- [ ] **Mobile apps** - React Native apps for iOS/Android
- [ ] **Email notifications** - Payment reminders and milestones
- [ ] **Budget planning** - Monthly budget tracking
- [ ] **Payment scheduling** - Recurring payment automation
- [ ] **Credit score integration** - API integration with credit bureaus
- [ ] **Export features** - PDF reports, CSV exports
- [ ] **Goal setting** - Debt-free date goals with progress tracking
- [ ] **Account linking** - Plaid integration for automatic syncing
- [ ] **Advanced analytics** - Debt avalanche/snowball calculators

### Technical Improvements

- [ ] E2E testing (Playwright)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Docker support (optional for development)
- [ ] WebSocket support for real-time updates
- [ ] GraphQL API (alternative to REST)
- [ ] Redis caching layer
- [ ] Microservices architecture (if scaling needed)

---

## Known Limitations

1. **Single-user architecture** - Each user has isolated data (by design)
2. **Manual transaction entry** - No automatic bank syncing
3. **No recurring transactions** - Must manually enter each transaction
4. **Basic reporting** - Limited export and reporting features
5. **No mobile apps** - Web-only interface (mobile-responsive)
6. **English only** - No internationalization (i18n) yet

---

## Support and Contributing

### Getting Help

- **Documentation:** Browse `docs/` directory
- **Issues:** Open issue on GitHub
- **Questions:** Create discussion on GitHub

### Contributing

Contributions welcome! See `CONTRIBUTING.md` for guidelines.

**Process:**
1. Fork repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Wait for review

---

## License

This project is licensed under the **MIT License**.

See `LICENSE` file for full license text.

---

## Project Metrics

| Metric | Value |
|--------|-------|
| **Lines of Code** | ~15,000+ |
| **Backend Files** | 120+ |
| **Frontend Files** | 130+ |
| **API Endpoints** | 43 |
| **Database Tables** | 4 |
| **React Components** | 50+ |
| **Test Files** | 20+ |
| **Documentation Files** | 15+ |
| **npm Dependencies** | 80+ |
| **Development Time** | ~40 agent sessions |

---

## Acknowledgments

### Technologies Used

Special thanks to the open-source communities behind:

- React, Node.js, PostgreSQL
- Express, Prisma, Vite
- Chart.js, Tailwind CSS
- TypeScript, Jest, Vitest
- And many more amazing tools!

### Development Approach

This project demonstrates the effectiveness of AI-agent-based development with Claude, using specialized agents for different aspects of the application.

---

## Contact

**Project Repository:** https://github.com/dmcguire80/Budget-Reduction-Tracking

**Maintainer:** Budget Reduction Tracking Team

**Email:** [Your contact email]

---

**Built with ❤️ using AI-powered agent-based development**

