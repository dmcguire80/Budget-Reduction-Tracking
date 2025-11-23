# Frontend - Budget Reduction Tracking

React + TypeScript + Vite frontend for Budget Reduction Tracking.

## Agents Working Here

- **Agent 6**: Frontend Core & Setup Engineer
- **Agent 7**: Frontend Authentication Engineer
- **Agent 8**: Frontend Accounts Engineer
- **Agent 9**: Frontend Transactions Engineer
- **Agent 10**: Frontend Charts & Visualization Engineer
- **Agent 11**: Frontend Dashboard Engineer

## Setup

```bash
npm install
cp .env.example .env
# Configure your .env file
npm run dev
```

## Structure

```
src/
├── components/    # React components
│   ├── common/    # Reusable components
│   ├── layout/    # Layout components
│   ├── accounts/  # Account components
│   ├── transactions/
│   └── charts/
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── services/      # API service layer
├── types/         # TypeScript types
├── utils/         # Utility functions
├── context/       # React Context providers
└── config/        # Configuration
```

## Development

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Component Development

All components should be:
- Typed with TypeScript
- Tested with React Testing Library
- Documented with JSDoc comments
- Responsive and accessible

## Agent Tasks

Refer to [AGENTS.md](../AGENTS.md) for detailed task assignments.
