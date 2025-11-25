# Testing Documentation

This document provides comprehensive information about testing in the Budget Reduction Tracking application.

## Table of Contents

- [Overview](#overview)
- [Testing Strategy](#testing-strategy)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Coverage](#test-coverage)
- [Best Practices](#best-practices)
- [Continuous Integration](#continuous-integration)

## Overview

The Budget Reduction Tracking application uses a comprehensive testing approach with unit tests, integration tests, and component tests to ensure code quality and reliability.

### Technology Stack

**Backend:**
- **Testing Framework:** Jest
- **Test Runner:** ts-jest
- **API Testing:** Supertest
- **Mocking:** Jest mocks

**Frontend:**
- **Testing Framework:** Vitest
- **Component Testing:** React Testing Library
- **DOM Environment:** jsdom
- **User Events:** @testing-library/user-event

## Testing Strategy

### Test Pyramid

We follow the test pyramid approach:

```
    /\
   /  \     E2E Tests (Future)
  /----\
 /      \   Integration Tests
/--------\
/          \ Unit Tests
/____________\
```

1. **Unit Tests (70%)** - Test individual functions, components, and services
2. **Integration Tests (25%)** - Test API endpoints and component interactions
3. **E2E Tests (5%)** - Future: Full user workflows

### Coverage Goals

- **Backend:** 80%+ overall coverage
- **Frontend:** 70%+ overall coverage
- **Critical Paths:** 100% coverage (auth, financial calculations, transaction processing)

## Backend Testing

### Directory Structure

```
backend/
├── src/
│   ├── __tests__/
│   │   ├── setup.ts                 # Global test setup
│   │   ├── helpers/
│   │   │   └── database.ts          # Test database utilities
│   │   ├── services/
│   │   │   ├── auth.service.test.ts
│   │   │   ├── account.service.test.ts
│   │   │   ├── transaction.service.test.ts
│   │   │   ├── analytics.service.test.ts
│   │   │   └── projection.service.test.ts
│   │   └── integration/
│   │       └── auth.test.ts
│   └── ...
└── jest.config.js
```

### Test Database Setup

Tests use a separate test database to avoid polluting production/development data:

```typescript
// Set TEST_DATABASE_URL in .env.test
TEST_DATABASE_URL="postgresql://user:password@localhost:5432/budget_tracking_test"
```

The test database is automatically:
- Connected before all tests
- Cleared between each test
- Disconnected after all tests

### Backend Test Examples

#### Unit Test Example

```typescript
describe('AccountService', () => {
  describe('createAccount', () => {
    it('should create a new account', async () => {
      const accountData = {
        name: 'Test Credit Card',
        accountType: AccountType.CREDIT_CARD,
        currentBalance: 1500,
        creditLimit: 5000,
        interestRate: 18.99,
      };

      const result = await createAccount(testUser.id, accountData);

      expect(result).toMatchObject(accountData);
      expect(result.userId).toBe(testUser.id);
    });
  });
});
```

#### Integration Test Example

```typescript
describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.user.email).toBe('test@example.com');
    expect(response.body.data.tokens).toHaveProperty('accessToken');
  });
});
```

## Frontend Testing

### Directory Structure

```
frontend/
├── src/
│   ├── test/
│   │   └── setup.ts                 # Global test setup
│   ├── utils/
│   │   └── __tests__/
│   │       └── format.test.ts
│   ├── hooks/
│   │   └── __tests__/
│   │       └── useAuth.test.ts
│   ├── components/
│   │   ├── common/
│   │   │   └── __tests__/
│   │   │       └── Button.test.tsx
│   │   └── ...
│   └── pages/
│       └── __tests__/
│           └── Login.test.tsx
└── vitest.config.ts
```

### Frontend Test Examples

#### Utility Test Example

```typescript
describe('formatCurrency', () => {
  it('should format currency with cents by default', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('should format currency without cents when specified', () => {
    expect(formatCurrency(1234.56, false)).toBe('$1,235');
  });
});
```

#### Component Test Example

```typescript
describe('Button', () => {
  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button isLoading>Click me</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
```

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Run Specific Tests

**Backend:**
```bash
# Run specific test file
npm test -- src/__tests__/services/auth.service.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should register"
```

**Frontend:**
```bash
# Run specific test file
npm test -- src/utils/__tests__/format.test.ts

# Run tests matching pattern
npm test -- -t "formatCurrency"
```

## Writing Tests

### General Guidelines

1. **Follow AAA Pattern:** Arrange, Act, Assert
   ```typescript
   it('should do something', () => {
     // Arrange
     const input = 'test';

     // Act
     const result = doSomething(input);

     // Assert
     expect(result).toBe('expected');
   });
   ```

2. **Use Descriptive Test Names**
   - Good: `should return error when email already exists`
   - Bad: `test register function`

3. **Test One Thing Per Test**
   - Each test should verify a single behavior
   - If you need multiple assertions, they should all relate to the same behavior

4. **Don't Test Implementation Details**
   - Test behavior, not internal implementation
   - Test what the user sees/experiences

### Mocking Guidelines

**Backend Mocking:**
```typescript
// Mock external services
jest.mock('../../utils/logger', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock specific functions
jest.mock('../../utils/jwt');
mockJwtUtils.generateAccessToken.mockReturnValue('mock_token');
```

**Frontend Mocking:**
```typescript
// Mock hooks
vi.mock('@hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Mock API calls
vi.mock('@services/api', () => ({
  fetchAccounts: vi.fn().mockResolvedValue([]),
}));
```

### Testing Async Code

**Backend:**
```typescript
it('should handle async operations', async () => {
  const result = await someAsyncFunction();
  expect(result).toBeDefined();
});
```

**Frontend:**
```typescript
it('should handle async rendering', async () => {
  render(<AsyncComponent />);

  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### Testing Errors

**Backend:**
```typescript
it('should throw error for invalid input', async () => {
  await expect(
    createAccount('invalid-user-id', invalidData)
  ).rejects.toThrow(AppError);
});
```

**Frontend:**
```typescript
it('should display error message', async () => {
  render(<Component />);

  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent('Error message');
  });
});
```

## Test Coverage

### Viewing Coverage Reports

After running tests with coverage, view the HTML report:

**Backend:**
```bash
cd backend
npm run test:coverage
open coverage/lcov-report/index.html
```

**Frontend:**
```bash
cd frontend
npm run test:coverage
open coverage/index.html
```

### Coverage Thresholds

**Backend (jest.config.js):**
```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

**Frontend (vitest.config.ts):**
```typescript
coverage: {
  thresholds: {
    lines: 70,
    functions: 70,
    branches: 70,
    statements: 70,
  },
}
```

### What to Exclude from Coverage

- Type definitions (`.d.ts`)
- Configuration files
- Test files themselves
- Mock data
- Main entry points (`index.ts`, `main.tsx`)

## Best Practices

### 1. Keep Tests Fast

- Use mocks for external dependencies
- Use test database with minimal data
- Avoid unnecessary async operations

### 2. Keep Tests Independent

- Each test should be able to run in isolation
- Don't rely on test execution order
- Clean up after each test

### 3. Use Test Data Builders

```typescript
// Good - reusable test data
function createTestUser(overrides = {}) {
  return {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    ...overrides,
  };
}

it('should create user', async () => {
  const userData = createTestUser({ email: 'custom@example.com' });
  // ...
});
```

### 4. Test Edge Cases

- Empty inputs
- Null/undefined values
- Boundary values
- Error conditions
- Concurrent operations

### 5. Accessibility Testing

```typescript
// Use semantic queries
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);

// Not
screen.getByTestId('submit-button');
```

### 6. Avoid Testing Libraries

Don't test third-party libraries - assume they work. Test how you use them.

## Continuous Integration

### GitHub Actions Workflow

Tests run automatically on:
- Every push to any branch
- Every pull request
- Before deployments

See `.github/workflows/test.yml` for the complete CI configuration.

### CI Test Commands

```bash
# Backend
cd backend && npm ci && npm run test:ci

# Frontend
cd frontend && npm ci && npm run test:coverage
```

## Troubleshooting

### Common Issues

**Backend:**

1. **Database connection errors**
   - Ensure TEST_DATABASE_URL is set correctly
   - Database server is running
   - Test database exists

2. **Timeout errors**
   - Increase testTimeout in jest.config.js
   - Check for unresolved promises

**Frontend:**

1. **Component not found**
   - Use screen.debug() to see rendered output
   - Check if component is conditionally rendered

2. **Act warnings**
   - Wrap state updates in act()
   - Use waitFor() for async updates

### Getting Help

- Check test output for specific error messages
- Review this documentation
- Ask team members in Slack
- Check Jest/Vitest documentation

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://testingjavascript.com/)
