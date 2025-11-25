# Contributing to Budget Reduction Tracking

This project is being developed by specialized AI agents, each responsible for different components. This document outlines how agents should contribute.

## Agent Workflow

### 1. Review Your Assignment
- Read [AGENTS.md](./AGENTS.md) for your specific tasks
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for design decisions
- Check integration points with other agents

### 2. Development Process

#### Branch Naming
- Feature branches: `feature/agent-{number}-{description}`
- Example: `feature/agent-1-docker-setup`

#### Commit Messages
Follow conventional commits format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(backend): implement user authentication service

Add JWT-based authentication with bcrypt password hashing.
Includes login, register, and token refresh endpoints.

Agent: 3
```

```
feat(frontend): create account list component

Implements AccountList component with filtering and sorting.
Integrates with React Query for data fetching.

Agent: 8
```

#### Code Style

**TypeScript/JavaScript**
- Use TypeScript strict mode
- Prefer functional components (React)
- Use async/await over promises
- Use meaningful variable names
- Add JSDoc comments for public APIs

**File Organization**
- One component per file
- Group related files in directories
- Index files for easy imports
- Keep files under 300 lines

**Naming Conventions**
- Components: PascalCase (`AccountList.tsx`)
- Utilities: camelCase (`formatCurrency.ts`)
- Constants: UPPER_SNAKE_CASE
- Types/Interfaces: PascalCase

### 3. Testing Requirements

**Backend**
- Unit tests for services
- Integration tests for API endpoints
- Minimum 80% coverage

**Frontend**
- Component tests for UI components
- Integration tests for user flows
- Minimum 70% coverage

### 4. Documentation

Document your code:
- JSDoc comments for functions
- README updates for new features
- API documentation updates
- Architecture documentation if needed

### 5. Integration

Before marking your work complete:
- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] Integration with dependent agents verified
- [ ] No console errors or warnings
- [ ] Code is committed and pushed

### 6. Code Review

For agents capable of review:
- Review code for correctness
- Check for security issues
- Verify tests are adequate
- Ensure documentation is clear
- Confirm architectural alignment

## Agent Coordination

### Communication
- Document decisions in code comments
- Update AGENTS.md with progress
- Report blockers immediately
- Share insights with other agents

### Integration Points
Check [AGENTS.md](./AGENTS.md) for:
- Which agents depend on your work
- Which agents' work you depend on
- Integration testing requirements

### Conflict Resolution
If you encounter:
- **Architectural conflicts**: Consult the architect
- **API contract disputes**: Refer to ARCHITECTURE.md
- **Integration issues**: Coordinate with affected agents
- **Technical blockers**: Document and escalate

## Development Setup

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git
- PostgreSQL 16 (or use Docker)

### Initial Setup
```bash
# Clone repository
git clone https://github.com/dmcguire80/Budget-Reduction-Tracking.git
cd Budget-Reduction-Tracking

# Backend setup
cd backend
npm install
cp .env.example .env
# Configure .env
npx prisma migrate dev
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env
# Configure .env
npm run dev

# Or use Docker
docker-compose up -d
```

## Quality Standards

### Code Quality
- No TypeScript errors
- No ESLint errors
- Prettier formatting applied
- All tests pass
- No commented-out code
- No console.log statements (use logger)

### Security
- No secrets in code
- Input validation on all endpoints
- SQL injection prevention
- XSS protection
- CORS properly configured
- Rate limiting implemented

### Performance
- Optimize database queries
- Use pagination for large datasets
- Implement caching where appropriate
- Code splitting for frontend
- Lazy loading for heavy components

## Testing

### Running Tests

**Backend**
```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

**Frontend**
```bash
cd frontend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Test Standards
- Test happy paths
- Test error conditions
- Test edge cases
- Test integration points
- Mock external dependencies

## Deployment

Agents working on deployment (Agent 1, 14):
- Follow [DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- Test deployment process locally
- Document any issues
- Update deployment documentation

## Questions?

If you're unclear about:
- **Architecture**: Review ARCHITECTURE.md or ask architect
- **Your tasks**: Check AGENTS.md
- **API contracts**: See API.md (when available)
- **Integration**: Contact dependent agents

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Remember**: Quality over speed. Write clean, tested, documented code that other agents can easily integrate with.

