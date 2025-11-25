# Budget Reduction Tracking - Frontend

React + TypeScript + Vite frontend for the Budget Reduction Tracking application.

## Overview

This is a modern, fully-featured React application built with TypeScript, Vite, and Tailwind CSS. It provides a comprehensive interface for tracking debt reduction progress, managing accounts, recording transactions, and visualizing financial analytics.

## Tech Stack

### Core
- **React 19.2** - UI library
- **TypeScript 5.9** - Type safety
- **Vite 7.2** - Build tool and dev server

### Routing & State
- **React Router 7.9** - Client-side routing
- **TanStack Query 5.90** - Server state management
- **Axios 1.13** - HTTP client

### Forms & Validation
- **React Hook Form 7.66** - Form management
- **Zod 4.1** - Schema validation
- **@hookform/resolvers** - Integration layer

### UI & Styling
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **@tailwindcss/forms** - Form styling
- **clsx** - Conditional class names

### Charts & Visualization
- **Chart.js 4.5** - Chart library
- **react-chartjs-2 5.3** - React wrapper for Chart.js

### Utilities
- **date-fns 4.1** - Date manipulation

## Getting Started

### Prerequisites

- Node.js 20 LTS or higher
- npm 10 or higher

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/yourusername/Budget-Reduction-Tracking.git
   cd Budget-Reduction-Tracking/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   ```env
   VITE_API_URL=http://localhost:3001
   VITE_APP_NAME=Budget Reduction Tracker
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:5173](http://localhost:5173)

## Available Scripts

### Development
```bash
npm run dev          # Start Vite dev server with HMR
```

### Building
```bash
npm run build        # Build for production (runs type-check first)
npm run preview      # Preview production build locally
```

### Quality Checks
```bash
npm run type-check   # Run TypeScript type checking
npm run lint         # Run ESLint
```

## Project Structure

```
src/
├── components/          # React components
│   ├── common/         # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── EmptyState.tsx
│   │   └── ErrorBoundary.tsx
│   ├── layout/         # Layout components
│   │   ├── AppLayout.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── accounts/       # Account-specific components (TBD by Agent 8)
│   ├── transactions/   # Transaction components (TBD by Agent 9)
│   └── charts/         # Chart components (TBD by Agent 10)
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Accounts.tsx
│   └── NotFound.tsx
├── hooks/              # Custom React hooks (TBD)
├── services/           # API service layer
│   └── api.ts         # Axios instance with interceptors
├── types/              # TypeScript type definitions
│   ├── index.ts       # Common types
│   └── api.ts         # API response types
├── utils/              # Utility functions
│   ├── format.ts      # Formatting utilities
│   ├── validation.ts  # Zod validation schemas
│   └── storage.ts     # localStorage helpers
├── context/            # React context providers (TBD by Agent 7)
├── config/             # Configuration files
│   └── constants.ts   # App constants and config
└── assets/             # Static assets
```

## Architecture

### Routing

The application uses React Router v7 with the following structure:

- **Public routes** (no layout):
  - `/login` - Login page
  - `/register` - Registration page

- **Protected routes** (with AppLayout):
  - `/` - Dashboard
  - `/accounts` - Accounts list
  - `/accounts/:id` - Account detail
  - `/transactions` - Transactions list
  - `/analytics` - Analytics dashboard
  - `/settings` - Settings page

### State Management

- **Server State**: TanStack Query (React Query) for all API data
- **UI State**: React hooks and context
- **Form State**: React Hook Form

### API Integration

All API calls go through the configured Axios instance (`src/services/api.ts`) which:
- Adds authentication tokens automatically
- Handles common error scenarios
- Provides consistent error messages
- Redirects to login on 401 errors

### Styling System

The app uses Tailwind CSS with a custom theme:

**Colors:**
- Primary: Blue (main actions, links)
- Success: Green (debt reduction, positive actions)
- Danger: Red (debt increase, errors)
- Warning: Yellow (warnings)
- Info: Cyan (information)
- Secondary: Gray (neutral actions)

**Utility Classes:**
- `.card` - Card container
- `.badge-*` - Badge variants
- `.alert-*` - Alert variants
- `.gradient-*` - Gradient backgrounds

## Component Documentation

### Common Components

#### Button
Reusable button with variants and states.

```tsx
import Button from '@components/common/Button';

<Button variant="primary" size="md" isLoading={false}>
  Click Me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
- `size`: 'sm' | 'md' | 'lg'
- `isLoading`: boolean
- `fullWidth`: boolean

#### Input
Form input with label and error display.

```tsx
import Input from '@components/common/Input';

<Input
  label="Email"
  type="email"
  error={errors.email?.message}
  {...register('email')}
/>
```

#### Card
Container component with sections.

```tsx
import { Card, CardHeader, CardBody, CardFooter } from '@components/common/Card';

<Card>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
  <CardFooter>Actions</CardFooter>
</Card>
```

#### Modal
Dialog with backdrop and animations.

```tsx
import Modal from '@components/common/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"
>
  Modal content
</Modal>
```

### Layout Components

The `AppLayout` component provides the main application structure with:
- Sticky header
- Collapsible sidebar (mobile-responsive)
- Main content area
- Footer

## Utility Functions

### Formatting

```tsx
import { formatCurrency, formatDate, formatPercentage } from '@utils/format';

formatCurrency(1234.56); // "$1,234.56"
formatDate(new Date());  // "Nov 23, 2025"
formatPercentage(0.15);  // "15.0%"
```

### Validation

```tsx
import { emailSchema, passwordSchema } from '@utils/validation';
import { z } from 'zod';

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
```

### Storage

```tsx
import { getItem, setItem, removeItem } from '@utils/storage';

setItem('key', { data: 'value' });
const data = getItem<{ data: string }>('key');
removeItem('key');
```

## Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the frontend.

**Available variables:**
- `VITE_API_URL` - Backend API base URL
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version
- `VITE_ENV_LABEL` - Environment label (dev, staging, etc.)
- `VITE_DEBUG` - Enable debug mode
- `VITE_API_TIMEOUT` - API request timeout (ms)

## Development Guidelines

### Code Style

- Use functional components with hooks
- Prefer TypeScript strict mode
- Use proper prop typing with interfaces
- Add JSDoc comments for complex functions
- Follow component naming conventions

### Component Structure

```tsx
/**
 * Component description
 */

import { useState } from 'react';
import type { ComponentProps } from '@types';

interface MyComponentProps {
  // Props interface
}

const MyComponent = ({ prop1, prop2 }: MyComponentProps) => {
  // Component logic
  return <div>...</div>;
};

export default MyComponent;
```

### Path Aliases

Use path aliases for cleaner imports:

```tsx
import Button from '@components/common/Button';
import { API_URL } from '@config/constants';
import { formatCurrency } from '@utils/format';
```

Available aliases:
- `@/` → `src/`
- `@components/` → `src/components/`
- `@pages/` → `src/pages/`
- `@hooks/` → `src/hooks/`
- `@services/` → `src/services/`
- `@types/` → `src/types/`
- `@utils/` → `src/utils/`
- `@config/` → `src/config/`
- `@context/` → `src/context/`
- `@assets/` → `src/assets/`

## Testing

Testing infrastructure will be added by Agent 12.

## Deployment

For deployment instructions, see the main [DEPLOYMENT.md](../docs/DEPLOYMENT.md) guide.

## Contributing

Refer to [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## Agents Working Here

This frontend was set up by **Agent 6: Frontend Core & Setup Engineer** and will be enhanced by:
- **Agent 7**: Frontend Authentication Engineer
- **Agent 8**: Frontend Accounts Engineer
- **Agent 9**: Frontend Transactions Engineer
- **Agent 10**: Frontend Charts & Visualization Engineer
- **Agent 11**: Frontend Dashboard Engineer
- **Agent 12**: Testing & QA Engineer

## License

See [LICENSE](../LICENSE) file in the root directory.

## Support

For issues and questions, please open an issue on GitHub.

---

**Version**: 1.0.0
**Last Updated**: 2025-11-23
**Agent**: Agent 6 (Frontend Core & Setup Engineer)
