# Docker Configuration (Optional - Development Only)

**Note**: This project deploys to **Proxmox LXC** in production, NOT Docker.

Docker configurations here are **optional** and only for local development convenience.

## Purpose

Provides Docker Compose setup for running PostgreSQL during local development if you don't want to install PostgreSQL natively.

## Usage

### PostgreSQL Only (Recommended for Development)
```bash
# Start just PostgreSQL in Docker
docker run -d \
  --name budget-tracking-db \
  -e POSTGRES_PASSWORD=dev_password \
  -e POSTGRES_DB=budget_tracking \
  -e POSTGRES_USER=budget_user \
  -p 5432:5432 \
  postgres:16

# Stop and remove
docker stop budget-tracking-db
docker rm budget-tracking-db
```

### Full Stack (Alternative - Not Used in Production)
```bash
# Optional docker-compose for full local development
docker-compose up -d

# This is NOT how the app is deployed in production
# Production uses LXC containers on Proxmox
```

## Production Deployment

**DO NOT USE DOCKER FOR PRODUCTION**

Production deployment uses:
- Proxmox LXC containers
- Native Node.js with PM2
- Native PostgreSQL service
- Native Nginx web server

See [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for production deployment guide.

## Files in This Directory

- `docker-compose.yml` - Optional PostgreSQL for development (if created)
- This directory may remain mostly empty as Docker is not used in production
