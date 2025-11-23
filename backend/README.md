# Backend - Budget Reduction Tracking

Node.js + Express + TypeScript + Prisma backend for Budget Reduction Tracking.

## Agents Working Here

- **Agent 2**: Database & Backend Core Engineer
- **Agent 3**: Authentication & Authorization Engineer
- **Agent 4**: API Endpoints Engineer
- **Agent 5**: Analytics & Calculations Engineer

## Setup

```bash
npm install
cp .env.example .env
# Configure your .env file
npx prisma migrate dev
npm run dev
```

## Structure

```
src/
├── controllers/   # Request handlers
├── services/      # Business logic
├── models/        # Prisma models
├── routes/        # API routes
├── middleware/    # Express middleware
├── validators/    # Request validation (Zod)
├── utils/         # Utility functions
├── config/        # Configuration
└── types/         # TypeScript types
```

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npx prisma studio` - Open Prisma Studio (database GUI)

## API Documentation

See [API.md](../docs/API.md) for complete API documentation.

## Agent Tasks

Refer to [AGENTS.md](../AGENTS.md) for detailed task assignments.
