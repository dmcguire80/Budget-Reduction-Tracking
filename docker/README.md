# Docker Configuration

Docker and Docker Compose configurations for Budget Reduction Tracking.

## Agent Responsible

- **Agent 1**: Infrastructure & DevOps Engineer

## Files

- `Dockerfile.backend` - Backend container
- `Dockerfile.frontend` - Frontend container
- `docker-compose.yml` - Development environment
- `docker-compose.prod.yml` - Production environment
- `nginx.conf` - Nginx configuration for frontend

## Usage

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Services

- **frontend**: React app served by Nginx (port 80/443)
- **backend**: Node.js Express API (port 3001, internal)
- **db**: PostgreSQL 16 (port 5432, internal)

## Agent Tasks

Refer to [AGENTS.md](../AGENTS.md) for detailed task assignments.
