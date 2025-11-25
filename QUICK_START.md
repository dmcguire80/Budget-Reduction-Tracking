# Quick Start Guide for Development Agents

This is a quick reference for agents starting work on the Budget Reduction Tracking project.

## 🎯 Your First Steps

1. **Read your assignment** in [AGENTS.md](./AGENTS.md)
2. **Review the architecture** in [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **Check dependencies** - see which agents you depend on
4. **Set up your environment** - see Development Setup below
5. **Start coding** - follow the task list in AGENTS.md

## 📋 Agent Quick Reference

| Agent | Focus Area | Directory | Dependencies |
|-------|-----------|-----------|--------------|
| Agent 1 | Infrastructure & DevOps | `/docker`, `/scripts` | None (start here) |
| Agent 2 | Database & Backend Core | `/backend` | Agent 1 |
| Agent 3 | Authentication | `/backend/src/services/auth` | Agent 2 |
| Agent 4 | API Endpoints | `/backend/src/controllers` | Agents 2, 3 |
| Agent 5 | Analytics & Calculations | `/backend/src/services/analytics` | Agent 4 |
| Agent 6 | Frontend Core | `/frontend` | Agent 1 |
| Agent 7 | Frontend Auth | `/frontend/src/pages`, `/frontend/src/context` | Agents 3, 6 |
| Agent 8 | Frontend Accounts | `/frontend/src/components/accounts` | Agents 4, 6, 7 |
| Agent 9 | Frontend Transactions | `/frontend/src/components/transactions` | Agents 4, 6, 7 |
| Agent 10 | Frontend Charts | `/frontend/src/components/charts` | Agents 5, 6 |
| Agent 11 | Frontend Dashboard | `/frontend/src/pages` | Agents 8, 9, 10 |
| Agent 12 | Testing & QA | All directories | All agents |
| Agent 13 | Documentation | `/docs` | All agents |
| Agent 14 | Integration & Assembly | All directories | All agents |

## 🏗️ Development Setup

### Option 1: Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Local Development
```bash
# Terminal 1: Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
npx prisma migrate dev
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
cp .env.example .env
# Edit .env with your settings
npm run dev

# Terminal 3: Database (if not using Docker)
# Run PostgreSQL locally or use Docker:
docker run -d \
  --name budget-tracking-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=budget_tracking \
  -p 5432:5432 \
  postgres:16
```

## 🔑 Environment Variables

### Backend `.env`
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/budget_tracking
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-secret-change-in-production
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Budget Reduction Tracker
```

## 🛠️ Common Commands

### Backend
```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npx prisma studio    # Open database GUI
npx prisma migrate dev # Create and apply migration
npx prisma generate  # Generate Prisma Client
```

### Frontend
```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests
npm run lint         # Run ESLint
npm run format       # Run Prettier
```

### Docker
```bash
docker-compose up -d                 # Start all services
docker-compose down                  # Stop all services
docker-compose logs -f [service]     # View logs
docker-compose restart [service]     # Restart service
docker-compose ps                    # List services
docker-compose exec backend sh       # Shell into backend
docker-compose exec db psql -U user budget_tracking  # Access database
```

## 📝 Git Workflow

### Branch Naming
```bash
feature/agent-{number}-{description}

# Examples:
feature/agent-1-docker-setup
feature/agent-3-jwt-auth
feature/agent-8-account-components
```

### Commit Message Format
```
<type>(scope): <subject>

<body>

Agent: {number}
```

**Types**: feat, fix, docs, style, refactor, test, chore

### Example Commits
```bash
git commit -m "feat(backend): implement user authentication

Add JWT-based authentication with bcrypt password hashing.
Includes login, register, and token refresh endpoints.

Agent: 3"

git commit -m "feat(frontend): create account list component

Implements AccountList with filtering, sorting, and pagination.
Integrates with React Query for data fetching.

Agent: 8"
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
npm test auth.service.spec  # Run specific test
```

### Frontend Tests
```bash
cd frontend
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
npm test AccountList        # Run specific test
```

## 🔍 Debugging

### Backend Debugging
- Add `debugger` statements
- Use VS Code debugger (attach to process)
- Check logs in `logs/` directory
- Use `console.log` during development (remove before commit)

### Frontend Debugging
- React DevTools extension
- Browser DevTools
- Redux DevTools (if using Redux)
- Network tab for API calls

### Database Debugging
```bash
# Prisma Studio (GUI)
npx prisma studio

# Direct psql access
docker-compose exec db psql -U postgres budget_tracking

# View schema
\dt
\d table_name
```

## 🚨 Common Issues

### Port Already in Use
```bash
# Find and kill process using port
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
lsof -ti:5432 | xargs kill -9  # Database
```

### Database Connection Issues
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Verify credentials
- Check if port 5432 is accessible

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Prisma Issues
```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View current migrations
npx prisma migrate status
```

## 📚 Key Documentation

- **[README.md](./README.md)** - Project overview
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture (READ THIS!)
- **[AGENTS.md](./AGENTS.md)** - Your task assignments (READ THIS!)
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[API.md](./docs/API.md)** - API documentation (coming soon)

## 🎨 Code Style

### TypeScript
```typescript
// Good
const calculateInterest = (balance: number, rate: number): number => {
  return balance * (rate / 100);
};

// Bad
const calc = (b, r) => {
  return b * (r / 100);
};
```

### React Components
```typescript
// Good - Functional component with TypeScript
interface AccountCardProps {
  account: Account;
  onEdit: (id: string) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, onEdit }) => {
  return (
    <div className="account-card">
      <h3>{account.name}</h3>
      <button onClick={() => onEdit(account.id)}>Edit</button>
    </div>
  );
};

// Bad - No types, unclear naming
export const Card = ({ data, fn }) => {
  return <div onClick={fn}>{data.n}</div>;
};
```

## 🔗 Integration Points

Before marking your work complete, verify integration with:

1. **API Contracts** - Endpoints match ARCHITECTURE.md
2. **Data Models** - Types match Prisma schema
3. **Authentication** - Protected routes use auth middleware
4. **Error Handling** - Consistent error format
5. **Validation** - Input validation on frontend and backend

## ✅ Definition of Done

- [ ] Code written and working
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed (if applicable)
- [ ] No console errors
- [ ] Follows code style guidelines
- [ ] Integration verified
- [ ] Committed and pushed

## 🆘 Need Help?

1. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for design decisions
2. Check [AGENTS.md](./AGENTS.md) for your tasks and dependencies
3. Review code from dependent agents
4. Check integration points
5. Consult the architect if blocked

## 🚀 Ready to Start?

1. ✅ Read this document
2. ✅ Read [ARCHITECTURE.md](./ARCHITECTURE.md)
3. ✅ Read your section in [AGENTS.md](./AGENTS.md)
4. ✅ Set up your development environment
5. ✅ Create your feature branch
6. ✅ Start coding!

---

**Remember**: Quality over speed. Write clean, tested, documented code.

**Good luck, agents! Let's build something great! 🎉**

