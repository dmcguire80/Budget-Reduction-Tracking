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

### LXC Container on Proxmox

**Deployment Strategy**: Single LXC container with all services running natively (not Docker)

#### LXC Container Specifications
- **OS**: Ubuntu 22.04 LTS or Debian 12
- **CPU**: 2-4 cores
- **RAM**: 4-8 GB
- **Storage**: 20-50 GB (depending on data volume)
- **Networking**: Bridge to network with static IP

#### Service Architecture
```
LXC Container (budget-tracking)
├── Nginx (Frontend)
│   ├── Serves React production build
│   ├── Port 3000 (internal)
│   └── Reverse proxy to backend API
├── Node.js Backend (systemd service)
│   ├── Express API
│   ├── Port 3001 (internal)
│   └── Connects to PostgreSQL
├── PostgreSQL 16 (systemd service)
│   ├── Database server
│   ├── Port 5432 (localhost only)
│   └── Data directory: /var/lib/postgresql
└── Application Files
    ├── /opt/budget-tracking/frontend/dist
    ├── /opt/budget-tracking/backend
    └── /opt/budget-tracking/.env
```

#### External Access Stack
```
Internet
  ↓
Cloudflare (DNS + DDoS Protection)
  ↓
UniFi Gateway/Firewall (Port Forwarding: 80, 443)
  ↓
Nginx Proxy Manager (Proxmox LXC)
  ↓ (Reverse Proxy + SSL)
Budget Tracking App (Proxmox LXC)
  ↓
budget-tracking.yourdomain.com
```

### Proxmox LXC Setup Steps

1. **Create LXC Container**
   ```bash
   # In Proxmox shell
   pct create <VMID> local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst \
     --hostname budget-tracking \
     --memory 4096 \
     --cores 2 \
     --net0 name=eth0,bridge=vmbr0,ip=192.168.1.X/24,gw=192.168.1.1 \
     --storage local-lvm \
     --rootfs local-lvm:20
   ```

2. **Configure LXC Features**
   - Enable nesting if needed: `pct set <VMID> -features nesting=1`
   - Start container: `pct start <VMID>`

3. **Install Required Packages**
   ```bash
   # Inside LXC container
   apt update && apt upgrade -y
   apt install -y curl git nginx postgresql postgresql-contrib \
     build-essential certbot python3-certbot-nginx

   # Install Node.js 20 LTS
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt install -y nodejs

   # Install PM2 for process management
   npm install -g pm2
   ```

4. **Setup PostgreSQL**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE budget_tracking;
   CREATE USER budget_user WITH ENCRYPTED PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE budget_tracking TO budget_user;
   \q
   ```

5. **Deploy Application**
   ```bash
   # Clone repository
   cd /opt
   git clone https://github.com/dmcguire80/Budget-Reduction-Tracking.git budget-tracking
   cd budget-tracking

   # Backend setup
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with production settings
   npx prisma migrate deploy
   npm run build

   # Frontend setup
   cd ../frontend
   npm install
   cp .env.example .env
   # Edit .env with production settings
   npm run build
   ```

6. **Configure PM2 for Backend**
   ```bash
   cd /opt/budget-tracking/backend
   pm2 start dist/index.js --name budget-tracking-api
   pm2 save
   pm2 startup  # Follow instructions to enable on boot
   ```

7. **Configure Nginx**
   - See detailed configuration in DEPLOYMENT.md
   - Serves frontend on port 3000
   - Proxies /api to backend on 3001

### Nginx Proxy Manager (NPM) Configuration

**Assumption**: NPM is running in separate LXC container on Proxmox

#### NPM Proxy Host Setup
1. **Add Proxy Host** in NPM web interface
   - Domain: `budget-tracking.yourdomain.com`
   - Scheme: `http`
   - Forward Hostname/IP: `192.168.1.X` (Budget Tracking LXC IP)
   - Forward Port: `3000`
   - Cache Assets: ✓
   - Block Common Exploits: ✓
   - Websockets Support: ✓

2. **SSL Configuration** in NPM
   - SSL Certificate: Let's Encrypt
   - Force SSL: ✓
   - HTTP/2 Support: ✓
   - HSTS Enabled: ✓
   - HSTS Subdomains: ✓

3. **Advanced Configuration** (Optional)
   ```nginx
   # Custom Nginx Configuration in NPM
   client_max_body_size 10M;
   proxy_connect_timeout 600;
   proxy_send_timeout 600;
   proxy_read_timeout 600;
   send_timeout 600;
   ```

### Cloudflare Configuration

1. **DNS Records**
   ```
   Type: A
   Name: budget-tracking
   Content: <Your-Public-IP>
   Proxy: ✓ (Orange Cloud)
   TTL: Auto
   ```

2. **Cloudflare Settings**
   - SSL/TLS Mode: Full (Strict)
   - Always Use HTTPS: On
   - Automatic HTTPS Rewrites: On
   - Minimum TLS Version: 1.2
   - TLS 1.3: Enabled

3. **Security Settings**
   - Security Level: Medium
   - Challenge Passage: 30 minutes
   - Browser Integrity Check: On
   - WAF Rules: Configure as needed

### UniFi Network Configuration

1. **Port Forwarding Rules**
   - Name: HTTP
   - From: WAN
   - Port: 80
   - Forward IP: <NPM-LXC-IP>
   - Forward Port: 80
   - Protocol: TCP

   - Name: HTTPS
   - From: WAN
   - Port: 443
   - Forward IP: <NPM-LXC-IP>
   - Forward Port: 443
   - Protocol: TCP

2. **Firewall Rules** (Optional)
   - Create rule to allow only Cloudflare IPs
   - Reduces direct exposure to internet

3. **Local DNS** (Optional)
   - Add local DNS record for budget-tracking.yourdomain.com
   - Points to NPM LXC internal IP
   - Allows local network access without hairpinning

### Backup Strategy

1. **LXC Container Backup** (Proxmox)
   - Datacenter → Backup → Add
   - Schedule: Daily at 2 AM
   - Mode: Snapshot
   - Compression: ZSTD
   - Retention: 7 days

2. **Database Backup** (Inside LXC)
   ```bash
   # Automated backup script (in /opt/budget-tracking/scripts/backup-db.sh)
   pg_dump -U budget_user budget_tracking | gzip > /backups/budget_tracking_$(date +%Y%m%d_%H%M%S).sql.gz

   # Cron job (daily at 3 AM)
   0 3 * * * /opt/budget-tracking/scripts/backup-db.sh
   ```

3. **Application Files Backup**
   - Git repository keeps code safe
   - Backup .env files separately (secure location)
   - Document restore procedures

### Monitoring & Maintenance

1. **PM2 Monitoring**
   ```bash
   pm2 status
   pm2 logs budget-tracking-api
   pm2 monit
   ```

2. **System Resources**
   ```bash
   htop
   df -h
   free -h
   ```

3. **PostgreSQL Health**
   ```bash
   sudo -u postgres psql -c "SELECT version();"
   sudo -u postgres psql -c "SELECT datname, pg_size_pretty(pg_database_size(datname)) FROM pg_database;"
   ```

4. **Nginx Logs**
   ```bash
   tail -f /var/log/nginx/access.log
   tail -f /var/log/nginx/error.log
   ```

### Update Procedure

1. **Pull Latest Code**
   ```bash
   cd /opt/budget-tracking
   git pull origin main
   ```

2. **Update Backend**
   ```bash
   cd backend
   npm install
   npx prisma migrate deploy
   npm run build
   pm2 restart budget-tracking-api
   ```

3. **Update Frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   # Nginx automatically serves new build
   ```

4. **Verify Deployment**
   ```bash
   pm2 status
   curl http://localhost:3000
   curl http://localhost:3001/api/health
   ```

## Development Workflow

### Local Development

**Option 1: Native PostgreSQL**
```bash
# Install PostgreSQL locally
# macOS: brew install postgresql
# Ubuntu: apt install postgresql
# Start PostgreSQL service

# Backend
cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL in .env
npx prisma migrate dev
npm run dev  # Watch mode on port 3001

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev  # Vite dev server on port 5173
```

**Option 2: Docker PostgreSQL Only** (Optional for development)
```bash
# Start PostgreSQL in Docker
docker run -d \
  --name budget-tracking-db \
  -e POSTGRES_PASSWORD=dev_password \
  -e POSTGRES_DB=budget_tracking \
  -p 5432:5432 \
  postgres:16

# Then follow backend/frontend steps from Option 1
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
