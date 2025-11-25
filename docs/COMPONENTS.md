# Component Documentation

**Version:** 1.0.0
**Last Updated:** 2025-11-23
**Framework:** React 19.2 with TypeScript

## Table of Contents

- [Overview](#overview)
- [Component Categories](#component-categories)
- [Common Components](#common-components)
- [Layout Components](#layout-components)
- [Authentication Components](#authentication-components)
- [Account Components](#account-components)
- [Transaction Components](#transaction-components)
- [Chart Components](#chart-components)
- [Dashboard Components](#dashboard-components)
- [Component Patterns](#component-patterns)
- [Styling Guidelines](#styling-guidelines)

---

## Overview

This document provides comprehensive documentation for all reusable React components in the Budget Reduction Tracking application.

###Component Structure

All components follow a consistent structure:

```typescript
/**
 * Component Name
 *
 * Brief description of purpose
 */

import { ComponentType } from 'react';
import clsx from 'clsx';

export interface ComponentNameProps {
  // Props interface
}

export const ComponentName: React.FC<ComponentNameProps> = (props) => {
  // Component logic
  return (
    // JSX
  );
};

export default ComponentName;
```

---

## Component Categories

Components are organized into the following categories:

1. **Common Components**: Reusable UI primitives (Button, Input, Card, Modal, etc.)
2. **Layout Components**: Page structure (AppLayout, Header, Sidebar, Footer)
3. **Authentication Components**: Login and registration forms
4. **Account Components**: Account management UI
5. **Transaction Components**: Transaction management UI
6. **Chart Components**: Data visualization
7. **Dashboard Components**: Dashboard-specific components

---

## Common Components

### Button

**Location**: `src/components/common/Button.tsx`

**Purpose**: Reusable button component with variants, sizes, and loading states.

**Props:**

```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}
```

**Variants:**
- `primary`: Primary action (blue background)
- `secondary`: Secondary action (gray background)
- `danger`: Destructive action (red background)
- `ghost`: Minimal style (transparent background)
- `outline`: Outlined style (border only)

**Sizes:**
- `sm`: Small (px-3 py-1.5)
- `md`: Medium (px-4 py-2)
- `lg`: Large (px-6 py-3)

**Usage Examples:**

```tsx
// Primary button
<Button variant="primary" onClick={handleSubmit}>
  Submit
</Button>

// Loading state
<Button variant="primary" isLoading>
  Saving...
</Button>

// Full width button
<Button variant="secondary" fullWidth>
  Cancel
</Button>

// Danger button (small size)
<Button variant="danger" size="sm" onClick={handleDelete}>
  Delete
</Button>
```

**Styling:**
- Uses Tailwind CSS utility classes
- Smooth transitions on hover and focus
- Disabled state with reduced opacity
- Loading spinner animation

**Accessibility:**
- Proper ARIA attributes
- Keyboard navigation support
- Focus ring indicator
- Disabled state handling

---

### Card

**Location**: `src/components/common/Card.tsx`

**Purpose**: Container component for grouped content with optional header, body, and footer sections.

**Components:**
- `Card`: Main container
- `CardHeader`: Header section with border
- `CardBody`: Main content area
- `CardFooter`: Footer section with border and background

**Props:**

```typescript
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
```

**Usage Examples:**

```tsx
// Simple card
<Card>
  <p>Card content</p>
</Card>

// Card with sections
<Card>
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardBody>
    <p>Card content goes here</p>
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Card without padding
<Card noPadding>
  <img src="image.jpg" alt="Full width image" />
</Card>
```

**Styling:**
- White background with rounded corners
- Shadow for depth
- Border for definition
- Responsive padding

---

### Input

**Location**: `src/components/common/Input.tsx`

**Purpose**: Form input component with label, error states, and various types.

**Props:**

```typescript
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}
```

**Usage Examples:**

```tsx
// Basic input with label
<Input
  label="Account Name"
  placeholder="Enter account name"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

// Input with error
<Input
  label="Email"
  type="email"
  error="Invalid email address"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// Input with helper text
<Input
  label="Interest Rate"
  type="number"
  helperText="Enter as percentage (e.g., 18.99)"
  value={rate}
  onChange={(e) => setRate(e.target.value)}
/>

// Input with icon
<Input
  label="Search"
  icon={<SearchIcon />}
  placeholder="Search accounts..."
/>
```

**Styling:**
- Consistent height and padding
- Error state with red border
- Focus state with blue ring
- Disabled state with gray background

---

### Modal

**Location**: `src/components/common/Modal.tsx`

**Purpose**: Overlay dialog for displaying content above the main page.

**Props:**

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}
```

**Sizes:**
- `sm`: 400px max width
- `md`: 600px max width (default)
- `lg`: 800px max width
- `xl`: 1000px max width

**Usage Examples:**

```tsx
// Basic modal
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Add Account"
>
  <AccountForm onSubmit={handleSubmit} />
</Modal>

// Large modal
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Transaction Details"
  size="lg"
>
  <TransactionDetails transaction={transaction} />
</Modal>

// Modal without close button
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Confirmation"
  showCloseButton={false}
>
  <p>Are you sure?</p>
  <Button onClick={onClose}>Cancel</Button>
  <Button onClick={handleConfirm}>Confirm</Button>
</Modal>
```

**Features:**
- Backdrop click to close
- ESC key to close
- Focus trap
- Smooth animations
- Scrollable content

**Accessibility:**
- ARIA role="dialog"
- Focus management
- Keyboard navigation
- Screen reader support

---

### LoadingSpinner

**Location**: `src/components/common/LoadingSpinner.tsx`

**Purpose**: Loading indicator for async operations.

**Props:**

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}
```

**Usage Examples:**

```tsx
// Default spinner
<LoadingSpinner />

// Large spinner with text
<LoadingSpinner size="lg" text="Loading accounts..." />

// Small spinner (inline)
<LoadingSpinner size="sm" />
```

---

### ErrorMessage

**Location**: `src/components/common/ErrorMessage.tsx`

**Purpose**: Display error messages with consistent styling.

**Props:**

```typescript
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}
```

**Usage Examples:**

```tsx
// Simple error message
<ErrorMessage message="Failed to load accounts" />

// Error with retry button
<ErrorMessage
  message="Network error. Please try again."
  onRetry={handleRetry}
/>
```

---

### EmptyState

**Location**: `src/components/common/EmptyState.tsx`

**Purpose**: Display empty state with call-to-action.

**Props:**

```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Usage Examples:**

```tsx
<EmptyState
  icon={<AccountIcon />}
  title="No accounts yet"
  description="Create your first account to start tracking debt"
  action={{
    label: "Add Account",
    onClick: () => setShowModal(true)
  }}
/>
```

---

## Layout Components

### AppLayout

**Location**: `src/components/layout/AppLayout.tsx`

**Purpose**: Main application layout with header, sidebar, and content area.

**Props:**

```typescript
interface AppLayoutProps {
  children: React.ReactNode;
}
```

**Usage:**

```tsx
<AppLayout>
  <Dashboard />
</AppLayout>
```

**Features:**
- Responsive layout
- Sticky header
- Collapsible sidebar (mobile)
- Footer

**Structure:**

```tsx
<div className="app-layout">
  <Header />
  <div className="content-wrapper">
    <Sidebar />
    <main className="main-content">
      {children}
    </main>
  </div>
  <Footer />
</div>
```

---

### Header

**Location**: `src/components/layout/Header.tsx`

**Purpose**: Top navigation bar with logo, user menu, and mobile menu toggle.

**Features:**
- Logo/brand
- Navigation links
- User dropdown menu
- Mobile menu toggle
- Logout button

**Responsive:**
- Desktop: Full navigation
- Mobile: Hamburger menu

---

### Sidebar

**Location**: `src/components/layout/Sidebar.tsx`

**Purpose**: Navigation sidebar with links to main sections.

**Navigation Items:**
- Dashboard
- Accounts
- Transactions
- Analytics
- Settings

**Features:**
- Active route highlighting
- Icons for each section
- Collapsible on mobile

---

### Footer

**Location**: `src/components/layout/Footer.tsx`

**Purpose**: Footer with copyright and links.

**Content:**
- Copyright notice
- Version number
- Links (Privacy, Terms, etc.)

---

## Authentication Components

### LoginForm

**Location**: `src/components/auth/LoginForm.tsx`

**Purpose**: User login form with validation.

**Features:**
- Email and password inputs
- Form validation
- Error display
- Remember me checkbox
- Forgot password link
- Loading state

**Usage:**

```tsx
<LoginForm onSuccess={() => navigate('/dashboard')} />
```

**Validation:**
- Email format validation
- Password required
- Error messages for invalid credentials

---

### RegisterForm

**Location**: `src/components/auth/RegisterForm.tsx`

**Purpose**: User registration form with validation.

**Features:**
- Name, email, password inputs
- Password strength indicator
- Form validation
- Error display
- Loading state
- Link to login

**Usage:**

```tsx
<RegisterForm onSuccess={() => navigate('/dashboard')} />
```

**Validation:**
- Email format and uniqueness
- Name required (min 2 chars)
- Password strength requirements
- Inline validation feedback

---

### PasswordStrengthIndicator

**Location**: `src/components/auth/PasswordStrengthIndicator.tsx`

**Purpose**: Visual indicator of password strength.

**Props:**

```typescript
interface PasswordStrengthIndicatorProps {
  password: string;
}
```

**Usage:**

```tsx
<PasswordStrengthIndicator password={password} />
```

**Levels:**
- Weak (red)
- Fair (yellow)
- Good (green)
- Strong (green)

**Criteria:**
- Length (8+ characters)
- Uppercase letters
- Lowercase letters
- Numbers
- Special characters

---

### ProtectedRoute

**Location**: `src/components/auth/ProtectedRoute.tsx`

**Purpose**: Route wrapper that requires authentication.

**Props:**

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
}
```

**Usage:**

```tsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

**Behavior:**
- Checks authentication status
- Redirects to login if not authenticated
- Shows loading spinner while checking
- Preserves intended route after login

---

## Account Components

### AccountCard

**Location**: `src/components/accounts/AccountCard.tsx`

**Purpose**: Display account summary in card format.

**Props:**

```typescript
interface AccountCardProps {
  account: Account;
}
```

**Usage:**

```tsx
<AccountCard account={account} />
```

**Displays:**
- Account name and type
- Current balance
- Credit limit (if applicable)
- Utilization rate (for credit cards)
- Interest rate
- Active/inactive status

**Features:**
- Click to navigate to detail page
- Hover effect
- Color-coded utilization bar
- Icon for account type

---

### AccountForm

**Location**: `src/components/accounts/AccountForm.tsx`

**Purpose**: Form for creating or editing accounts.

**Props:**

```typescript
interface AccountFormProps {
  account?: Account; // For editing
  onSubmit: (data: AccountFormData) => Promise<void>;
  onCancel: () => void;
}
```

**Usage:**

```tsx
// Create new account
<AccountForm
  onSubmit={handleCreate}
  onCancel={() => setShowModal(false)}
/>

// Edit existing account
<AccountForm
  account={existingAccount}
  onSubmit={handleUpdate}
  onCancel={() => setShowModal(false)}
/>
```

**Fields:**
- Name (required)
- Account Type (required)
- Current Balance (required)
- Credit Limit (optional)
- Interest Rate (required)
- Minimum Payment (optional)
- Due Day (optional)

**Validation:**
- Real-time field validation
- Form-level validation on submit
- Error messages per field

---

### AccountModal

**Location**: `src/components/accounts/AccountModal.tsx`

**Purpose**: Modal wrapper for AccountForm.

**Props:**

```typescript
interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account?: Account;
  onSuccess: () => void;
}
```

**Usage:**

```tsx
<AccountModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    setShowModal(false);
    refetch();
  }}
/>
```

**Features:**
- Handles form submission
- Shows loading state
- Displays success/error messages
- Auto-closes on success

---

### AccountStats

**Location**: `src/components/accounts/AccountStats.tsx`

**Purpose**: Display account statistics and metrics.

**Props:**

```typescript
interface AccountStatsProps {
  accountId: string;
}
```

**Usage:**

```tsx
<AccountStats accountId={account.id} />
```

**Displays:**
- Total paid
- Total charged
- Interest paid
- Number of transactions
- Last payment date
- Average monthly payment
- Reduction percentage

---

### AccountTypeIcon

**Location**: `src/components/accounts/AccountTypeIcon.tsx`

**Purpose**: Display icon for account type.

**Props:**

```typescript
interface AccountTypeIconProps {
  accountType: AccountType;
  size?: 'sm' | 'md' | 'lg';
}
```

**Usage:**

```tsx
<AccountTypeIcon accountType="CREDIT_CARD" size="md" />
```

**Icons:**
- CREDIT_CARD: Credit card icon
- PERSONAL_LOAN: Dollar sign
- AUTO_LOAN: Car icon
- MORTGAGE: House icon
- STUDENT_LOAN: Graduation cap
- OTHER: Document icon

---

## Transaction Components

### TransactionList

**Location**: `src/components/transactions/TransactionList.tsx`

**Purpose**: Display list of transactions with pagination.

**Props:**

```typescript
interface TransactionListProps {
  accountId?: string; // Filter by account
  limit?: number;
}
```

**Usage:**

```tsx
// All transactions
<TransactionList />

// Account-specific transactions
<TransactionList accountId={account.id} />
```

**Features:**
- Sortable columns
- Filterable by type and date
- Pagination
- Edit/delete actions
- Empty state

---

### TransactionForm

**Location**: `src/components/transactions/TransactionForm.tsx`

**Purpose**: Form for creating or editing transactions.

**Props:**

```typescript
interface TransactionFormProps {
  accountId?: string;
  transaction?: Transaction;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
}
```

**Usage:**

```tsx
<TransactionForm
  accountId={accountId}
  onSubmit={handleCreate}
  onCancel={() => setShowModal(false)}
/>
```

**Fields:**
- Account (dropdown)
- Type (PAYMENT, CHARGE, ADJUSTMENT, INTEREST)
- Amount (number)
- Date (date picker)
- Description (optional)

---

### TransactionModal

**Location**: `src/components/transactions/TransactionModal.tsx`

**Purpose**: Modal wrapper for TransactionForm.

**Props:**

```typescript
interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId?: string;
  transaction?: Transaction;
  onSuccess: () => void;
}
```

---

### QuickTransactionForm

**Location**: `src/components/transactions/QuickTransactionForm.tsx`

**Purpose**: Simplified form for quick transaction entry.

**Props:**

```typescript
interface QuickTransactionFormProps {
  accountId: string;
}
```

**Usage:**

```tsx
<QuickTransactionForm accountId={account.id} />
```

**Features:**
- Minimal fields (type, amount)
- Auto-fill date (today)
- Inline submission
- No modal required

---

### TransactionItem

**Location**: `src/components/transactions/TransactionItem.tsx`

**Purpose**: Single transaction row/item display.

**Props:**

```typescript
interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}
```

**Displays:**
- Date
- Type icon
- Description
- Amount (color-coded)
- Actions (edit, delete)

---

### TransactionFilters

**Location**: `src/components/transactions/TransactionFilters.tsx`

**Purpose**: Filter controls for transaction list.

**Props:**

```typescript
interface TransactionFiltersProps {
  onFilterChange: (filters: TransactionFilters) => void;
}
```

**Filters:**
- Date range
- Transaction type
- Account
- Amount range

---

### TransactionTypeIcon

**Location**: `src/components/transactions/TransactionTypeIcon.tsx`

**Purpose**: Display icon for transaction type.

**Props:**

```typescript
interface TransactionTypeIconProps {
  transactionType: TransactionType;
  size?: 'sm' | 'md' | 'lg';
}
```

**Icons:**
- PAYMENT: Arrow down (green)
- CHARGE: Arrow up (red)
- ADJUSTMENT: Wrench
- INTEREST: Percentage

---

## Chart Components

### BalanceReductionChart

**Location**: `src/components/charts/BalanceReductionChart.tsx`

**Purpose**: Line chart showing balance reduction over time (inverted).

**Props:**

```typescript
interface BalanceReductionChartProps {
  accountId: string;
  startDate?: Date;
  endDate?: Date;
}
```

**Usage:**

```tsx
<BalanceReductionChart
  accountId={account.id}
  startDate={new Date('2025-01-01')}
  endDate={new Date('2025-12-31')}
/>
```

**Features:**
- Inverted Y-axis (reduction shown as positive)
- Date range selector
- Tooltip with details
- Export to image

**Visualization:**
- X-axis: Time
- Y-axis: Amount reduced
- Line color: Green (positive trend)

---

### InterestForecastChart

**Location**: `src/components/charts/InterestForecastChart.tsx`

**Purpose**: Line chart showing projected interest accumulation.

**Props:**

```typescript
interface InterestForecastChartProps {
  accountId: string;
  months?: number;
}
```

**Usage:**

```tsx
<InterestForecastChart accountId={account.id} months={12} />
```

**Features:**
- Cumulative interest line
- Monthly breakdown
- Scenario comparison

---

### PaymentDistributionChart

**Location**: `src/components/charts/PaymentDistributionChart.tsx`

**Purpose**: Pie chart showing payment split between principal and interest.

**Props:**

```typescript
interface PaymentDistributionChartProps {
  accountId: string;
}
```

**Usage:**

```tsx
<PaymentDistributionChart accountId={account.id} />
```

**Visualization:**
- Green slice: Principal paid
- Red slice: Interest paid
- Percentages displayed
- Legend with totals

---

### ProgressChart

**Location**: `src/components/charts/ProgressChart.tsx`

**Purpose**: Progress bar and circular progress indicators.

**Props:**

```typescript
interface ProgressChartProps {
  accountId: string;
}
```

**Displays:**
- Percentage of debt eliminated
- Progress bar
- Milestones achieved
- Target date

---

### ProjectionChart

**Location**: `src/components/charts/ProjectionChart.tsx`

**Purpose**: Line chart showing payoff projections with different scenarios.

**Props:**

```typescript
interface ProjectionChartProps {
  accountId: string;
}
```

**Features:**
- Multiple scenario lines
- Color-coded by scenario
- Payoff date indicators
- Interactive legend

**Scenarios:**
- Minimum payment
- Recommended payment
- Aggressive payment
- Custom payment

---

### UtilizationChart

**Location**: `src/components/charts/UtilizationChart.tsx`

**Purpose**: Gauge chart showing credit utilization.

**Props:**

```typescript
interface UtilizationChartProps {
  accountId: string;
}
```

**Visualization:**
- Gauge/donut chart
- Color changes based on utilization:
  - Green: < 30%
  - Yellow: 30-70%
  - Red: > 70%

---

### ChartEmptyState

**Location**: `src/components/charts/ChartEmptyState.tsx`

**Purpose**: Empty state for charts with no data.

**Props:**

```typescript
interface ChartEmptyStateProps {
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

---

### ChartLoadingSkeleton

**Location**: `src/components/charts/ChartLoadingSkeleton.tsx`

**Purpose**: Loading skeleton for charts.

**Usage:**

```tsx
{isLoading ? <ChartLoadingSkeleton /> : <BalanceReductionChart />}
```

---

### ChartExport

**Location**: `src/components/charts/ChartExport.tsx`

**Purpose**: Export chart to image or PDF.

**Props:**

```typescript
interface ChartExportProps {
  chartRef: React.RefObject<HTMLCanvasElement>;
  filename: string;
}
```

---

### DateRangeSelector

**Location**: `src/components/charts/DateRangeSelector.tsx`

**Purpose**: Date range picker for filtering charts.

**Props:**

```typescript
interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onChange: (start: Date, end: Date) => void;
  presets?: Array<{label: string; range: [Date, Date]}>;
}
```

**Presets:**
- Last 30 days
- Last 90 days
- Last 6 months
- Last year
- All time
- Custom

---

## Dashboard Components

### SummaryCard

**Location**: `src/components/dashboard/SummaryCard.tsx`

**Purpose**: Display key metric in card format.

**Props:**

```typescript
interface SummaryCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger';
}
```

**Usage:**

```tsx
<SummaryCard
  title="Total Debt"
  value={formatCurrency(totalDebt)}
  icon={<DebtIcon />}
  trend={{ value: -1200, isPositive: true }}
  color="primary"
/>
```

**Features:**
- Large value display
- Optional icon
- Trend indicator (up/down arrow)
- Color theming

---

### RecentActivity

**Location**: `src/components/dashboard/RecentActivity.tsx`

**Purpose**: Display recent transactions across all accounts.

**Props:**

```typescript
interface RecentActivityProps {
  limit?: number;
}
```

**Usage:**

```tsx
<RecentActivity limit={10} />
```

**Displays:**
- Last N transactions
- Account name
- Transaction type and amount
- Date
- Link to full transaction list

---

### QuickActions

**Location**: `src/components/dashboard/QuickActions.tsx`

**Purpose**: Quick access buttons for common actions.

**Actions:**
- Add Account
- Add Transaction
- View Analytics
- Generate Report

**Usage:**

```tsx
<QuickActions />
```

---

### ProgressOverview

**Location**: `src/components/dashboard/ProgressOverview.tsx`

**Purpose**: Visual summary of debt reduction progress.

**Displays:**
- Overall progress percentage
- Per-account progress bars
- Milestones achieved
- Projected payoff date

**Usage:**

```tsx
<ProgressOverview />
```

---

### DashboardEmptyState

**Location**: `src/components/dashboard/DashboardEmptyState.tsx`

**Purpose**: Empty state for new users with no data.

**Features:**
- Welcome message
- Getting started guide
- Add account button

---

### Milestone

**Location**: `src/components/dashboard/Milestone.tsx`

**Purpose**: Display achieved milestones.

**Props:**

```typescript
interface MilestoneProps {
  title: string;
  description: string;
  date: Date;
  icon?: React.ReactNode;
}
```

**Examples:**
- 25% debt paid off
- 50% debt paid off
- First account paid off
- 6 months of consistent payments

---

### StatComparison

**Location**: `src/components/dashboard/StatComparison.tsx`

**Purpose**: Compare current vs. previous period stats.

**Props:**

```typescript
interface StatComparisonProps {
  label: string;
  current: number;
  previous: number;
  format?: 'currency' | 'percentage' | 'number';
}
```

**Usage:**

```tsx
<StatComparison
  label="Monthly Reduction"
  current={1200}
  previous={800}
  format="currency"
/>
```

---

## Component Patterns

### Compound Components

Many components use the compound component pattern for flexibility:

```tsx
// Card with sections
<Card>
  <CardHeader>Header</CardHeader>
  <CardBody>Body</CardBody>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Render Props

Some components accept render props for customization:

```tsx
<DataTable
  data={accounts}
  renderRow={(account) => (
    <AccountRow account={account} />
  )}
/>
```

### Custom Hooks

Components often use custom hooks for logic:

```tsx
const AccountCard = ({ account }) => {
  const { deleteAccount } = useAccounts();
  const { showModal } = useModal();

  // Component logic
};
```

### Error Boundaries

All major components are wrapped in error boundaries:

```tsx
<ErrorBoundary fallback={<ErrorMessage />}>
  <Dashboard />
</ErrorBoundary>
```

---

## Styling Guidelines

### Tailwind CSS

All components use Tailwind CSS for styling:

```tsx
<div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-2xl font-bold text-gray-900">Title</h2>
  <p className="text-gray-600">Description</p>
</div>
```

### Color Scheme

**Primary Colors:**
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)

**Neutral Colors:**
- Gray scale for text and borders

### Typography

**Font Sizes:**
- xs: 0.75rem
- sm: 0.875rem
- base: 1rem
- lg: 1.125rem
- xl: 1.25rem
- 2xl: 1.5rem
- 3xl: 1.875rem

**Font Weights:**
- normal: 400
- medium: 500
- semibold: 600
- bold: 700

### Spacing

Consistent spacing using Tailwind's spacing scale (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64)

### Responsive Design

Components are responsive by default:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items */}
</div>
```

**Breakpoints:**
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

---

## Conclusion

This component library provides a comprehensive set of reusable UI components for the Budget Reduction Tracking application. All components are:

- **Type-safe**: Full TypeScript support
- **Accessible**: WCAG 2.1 compliant
- **Responsive**: Mobile-first design
- **Tested**: Unit and integration tests
- **Documented**: Clear props and usage examples
- **Maintainable**: Consistent patterns and structure

For implementation details and examples, refer to the component source files in `frontend/src/components/`.

---

**Last Updated**: 2025-11-23
