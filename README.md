# Budget Reduction Tracking

A comprehensive web application for tracking debt reduction and credit management progress. Monitor your journey to financial freedom with detailed analytics, projections, and visualizations.

## Overview

Budget Reduction Tracking helps you take control of your debt by providing:
- **Account Management**: Track multiple credit accounts with interest rates and limits
- **Progress Visualization**: See your debt reduction as positive progress
- **Predictive Analytics**: Estimate payoff timelines and total interest costs
- **Transaction History**: Keep detailed records of all payments and charges
- **Interest Forecasting**: Understand the true cost of your debt over time

## Features

### Core Functionality
- ✅ Multiple account tracking (credit cards, loans, mortgages, etc.)
- ✅ Interest rate tracking and calculations
- ✅ Credit limit monitoring
- ✅ Transaction logging (payments, charges, adjustments)
- ✅ Automated balance snapshots
- ✅ Account categorization by type

### Visualization & Analytics
- ✅ **Balance Reduction Charts**: Inverted visualization showing reduction as progress
- ✅ **Interest Forecast**: Project total interest over loan lifetime
- ✅ **Payment Distribution**: See how payments split between principal and interest
- ✅ **Payoff Projections**: Estimate debt-free dates based on payment trends
- ✅ **Trend Analysis**: Track month-over-month reduction rates
- ✅ **What-If Scenarios**: Model different payment strategies
- ✅ **Multi-Account Dashboard**: Overview of all accounts with summary statistics
- ✅ **Progress Tracking**: Visual progress indicators and milestone tracking

### User Experience
- ✅ Secure authentication with JWT
- ✅ Responsive design (mobile-friendly)
- ✅ Modern, intuitive interface with Tailwind CSS
- ✅ Real-time updates
- ✅ Clean, focused dashboard
- ✅ Interactive charts and data visualization

## Technology Stack

### Frontend
- **React 19.2** with TypeScript 5.9
- **Chart.js 4.5** with react-chartjs-2 for data visualization
- **Tailwind CSS 4.1** with @tailwindcss/forms
- **TanStack React Query 5.90** for server state management
- **React Hook Form 7.66** with Zod validation
- **React Router 7.9** for navigation
- **Vite 7.2** for blazing-fast builds
- **Axios 1.13** for HTTP requests

### Backend
- **Node.js 20 LTS** with Express 4.18
- **TypeScript 5.3** for type safety
- **Prisma 5.7** ORM with PostgreSQL
- **JWT** (jsonwebtoken 9.0) authentication
- **Bcrypt 5.1** for password hashing
- **Zod 3.22** for request validation
- **Winston 3.11** for logging
- **Helmet 7.1** for security headers
- **CORS 2.8** and rate limiting

### Database
- **PostgreSQL 16** with optimized indexes
- **Prisma** migrations and schema management

### Infrastructure
- **Proxmox VE** with LXC containers
- **Nginx** web server and reverse proxy
- **PM2** process management
- **Nginx Proxy Manager** (reverse proxy & SSL)
- **Cloudflare** CDN/DNS/DDoS protection
- **UniFi** network gateway

## Project Status

✅ **Version 1.0.0 - Production Ready**

This project has been successfully developed by a team of specialized AI agents. All core features are complete and ready for deployment. See [CHANGELOG.md](./CHANGELOG.md) for the complete version history.

### Development Phases

#### Phase 1: Foundation ✅ Complete
- Infrastructure setup
- Database schema
- Authentication system
- Frontend core setup

#### Phase 2: Core Features ✅ Complete
- Account management
- Transaction tracking
- API endpoints

#### Phase 3: Analytics ✅ Complete
- Interest calculations
- Projections and forecasting
- Chart implementations
- Dashboard

#### Phase 4: Polish ✅ Complete
- Testing
- Documentation
- Integration
- Deployment guides

## Quick Start

### 🚀 One-Command Proxmox Install (Recommended)

Deploy to Proxmox with a single command that creates the LXC container and installs everything:

```bash
# SSH into your Proxmox host and run:
bash -c "$(curl -fsSL https://raw.githubusercontent.com/dmcguire80/Budget-Reduction-Tracking/main/proxmox-install.sh)"
```

**This command will:**
- ✅ Create a new LXC container automatically (VMID auto-assigned)
- ✅ Configure with 4GB RAM, 4 cores, 20GB disk, DHCP networking
- ✅ Install Node.js 20, PostgreSQL 16, Nginx, PM2
- ✅ Build and deploy the application
- ✅ Start all services
- ✅ Display the container IP and access URL

**Installation takes ~5-10 minutes.** Access the app at `http://[container-ip]:3000` when complete.

---

### 📦 Manual LXC Install

If you already have an LXC container set up, run this inside it:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/dmcguire80/Budget-Reduction-Tracking/main/install.sh)"
```

---

### Prerequisites

**For Proxmox Deployment**
- Proxmox VE 7.0+ host
- Ubuntu 22.04 LXC template (script will download if missing)
- Network connectivity

**For Manual LXC**
- Ubuntu 22.04/24.04 or Debian 11/12 LXC container
- Root or sudo access
- Internet connectivity

**For Local Development**
- Node.js 20 LTS
- PostgreSQL 16 (or Docker)
- Git

### Installation

**Local Development**
```bash
# Clone the repository
git clone https://github.com/dmcguire80/Budget-Reduction-Tracking.git
cd Budget-Reduction-Tracking

# Setup script (handles PostgreSQL, dependencies, migrations)
./scripts/setup-dev.sh

# Or manual setup:
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your database connection
npx prisma migrate dev
npm run dev  # Runs on port 3001

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev  # Runs on port 5173
```

**Production Deployment (Proxmox LXC)**
```bash
# See detailed guide in docs/DEPLOYMENT.md
# Quick deploy script:
./scripts/deploy-lxc.sh
```

### Environment Configuration

See `.env.example` files in `backend/` and `frontend/` directories for required environment variables.

## Screenshots

Coming soon! Screenshots will showcase:
- Dashboard with account overview
- Balance reduction charts
- Transaction management interface
- Account details with analytics
- Interest forecasting and projections

## Documentation

### Main Documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Comprehensive system architecture and design decisions
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and release notes
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines

### Technical Documentation
- **[docs/API.md](./docs/API.md)** - Complete API reference with all endpoints
- **[docs/DATABASE.md](./docs/DATABASE.md)** - Database schema and query guide
- **[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)** - Development setup and workflow
- **[docs/COMPONENTS.md](./docs/COMPONENTS.md)** - Frontend component library documentation
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Production deployment guide

### User Documentation
- **[docs/USER_GUIDE.md](./docs/USER_GUIDE.md)** - Complete user guide
- **[docs/QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md)** - Quick reference for common tasks

### Additional Resources
- **[AGENTS.md](./AGENTS.md)** - AI agent task delegation and responsibilities
- **[backend/README.md](./backend/README.md)** - Backend-specific documentation
- **[frontend/README.md](./frontend/README.md)** - Frontend-specific documentation

## Architecture Highlights

### Data Model
- **Users**: Secure authentication and user management
- **Accounts**: Credit cards, loans, mortgages with interest tracking
- **Transactions**: Payments, charges, and adjustments
- **Snapshots**: Historical balance tracking for trend analysis

### Key Design Decisions
- **Inverted Visualization**: Debt reduction shown as upward progress
- **Interest-Aware**: All calculations consider APR and compound interest
- **Predictive Analytics**: Machine learning-ready architecture for future enhancements
- **Privacy-First**: All financial data stored securely with user isolation
- **Scalable**: Containerized for easy deployment and scaling

## Deployment

Designed for deployment on Proxmox VE cluster using LXC containers:

**Architecture**:
```
Internet → Cloudflare → UniFi Gateway → NPM (LXC) → App (LXC)
```

**Quick Deploy**:
```bash
# Full automated deployment script
./scripts/deploy-lxc.sh

# Or follow manual steps in docs/DEPLOYMENT.md
```

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for complete Proxmox LXC setup, NPM configuration, Cloudflare DNS, and UniFi port forwarding instructions (coming soon).

## Development

### Project Structure
```
Budget-Reduction-Tracking/
├── backend/           # Node.js Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   └── prisma/       # Database schema and migrations
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
├── docker/           # Docker configurations
└── docs/             # Additional documentation
```

### Development Workflow
1. Each agent works on their assigned component
2. Feature branches for all development
3. Pull requests for code review
4. Automated testing before merge
5. Continuous integration with GitHub Actions

## Contributing

This project is currently being developed by specialized AI agents under architectural guidance. Each agent is responsible for specific components as outlined in [AGENTS.md](./AGENTS.md).

### Agent Coordination
- All agents follow the architecture defined in [ARCHITECTURE.md](./ARCHITECTURE.md)
- Regular integration checkpoints ensure components work together
- The architect reviews all design decisions and resolves conflicts

## Security

- JWT-based authentication
- Bcrypt password hashing
- SQL injection prevention via Prisma
- XSS protection
- CORS configuration
- Rate limiting
- HTTPS in production

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## License

MIT License - see [LICENSE](./LICENSE) file for details

## Roadmap

### v1.0 (Current)
- Core account and transaction management
- Basic charts and analytics
- Interest calculations
- Payoff projections

### v2.0 (Future)
- Bank account integration (Plaid API)
- Mobile app (React Native)
- Email notifications
- Advanced debt strategies (snowball/avalanche)
- Budget planning integration

### v3.0 (Future)
- AI-powered insights
- Collaborative debt planning
- Multi-currency support
- Export to PDF/Excel
- Third-party integrations

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

## Acknowledgments

- Architecture designed by Claude (AI Software Architect)
- Development by specialized AI agent team
- Built with modern web technologies
- Inspired by the need for better debt management tools

---

**Built with ❤️ to help people achieve financial freedom**

