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
- 📊 **Balance Reduction Charts**: Inverted visualization showing reduction as progress
- 📈 **Interest Forecast**: Project total interest over loan lifetime
- 💰 **Payment Distribution**: See how payments split between principal and interest
- 🎯 **Payoff Projections**: Estimate debt-free dates based on payment trends
- 📉 **Trend Analysis**: Track month-over-month reduction rates
- 🔮 **What-If Scenarios**: Model different payment strategies

### User Experience
- 🔐 Secure authentication with JWT
- 📱 Responsive design (mobile-friendly)
- 🎨 Modern, intuitive interface
- ⚡ Real-time updates
- 🌙 Clean, focused dashboard

## Technology Stack

### Frontend
- React 18+ with TypeScript
- Chart.js for data visualization
- Material-UI or Tailwind CSS
- React Query for state management
- Vite for blazing-fast builds

### Backend
- Node.js with Express
- TypeScript for type safety
- Prisma ORM with PostgreSQL
- JWT authentication
- RESTful API design

### Infrastructure
- Docker & Docker Compose
- PostgreSQL 16 database
- Nginx reverse proxy
- Proxmox VE deployment ready

## Project Status

🏗️ **Currently in Development**

This project is being actively developed by a team of specialized AI agents, each responsible for different components of the application. See [AGENTS.md](./AGENTS.md) for the detailed task breakdown.

### Development Phases

#### Phase 1: Foundation ✅ (Planned)
- Infrastructure setup
- Database schema
- Authentication system
- Frontend core setup

#### Phase 2: Core Features 🚧 (In Progress)
- Account management
- Transaction tracking
- API endpoints

#### Phase 3: Analytics 📋 (Upcoming)
- Interest calculations
- Projections and forecasting
- Chart implementations
- Dashboard

#### Phase 4: Polish 📋 (Upcoming)
- Testing
- Documentation
- Integration
- Deployment

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)
- PostgreSQL 16 (or use Docker)

### Installation

```bash
# Clone the repository
git clone https://github.com/dmcguire80/Budget-Reduction-Tracking.git
cd Budget-Reduction-Tracking

# Start with Docker Compose (easiest)
docker-compose up -d

# Or run locally
# Backend
cd backend
npm install
npm run dev

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

### Environment Configuration

See `.env.example` files in `backend/` and `frontend/` directories for required environment variables.

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Comprehensive system architecture and design decisions
- **[AGENTS.md](./AGENTS.md)** - Agent task delegation and responsibilities
- **[API.md](./API.md)** - API documentation (coming soon)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide for Proxmox (coming soon)
- **[USER_GUIDE.md](./USER_GUIDE.md)** - End-user documentation (coming soon)

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

Designed for deployment on Proxmox VE cluster:

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Proxmox setup instructions (coming soon).

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

