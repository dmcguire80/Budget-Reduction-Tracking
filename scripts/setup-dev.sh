#!/bin/bash
#
# Budget Reduction Tracking - Local Development Setup Script
#
# This script sets up a local development environment by:
# - Checking for PostgreSQL installation
# - Creating database and user
# - Installing backend dependencies
# - Installing frontend dependencies
# - Running database migrations
# - Seeding database with sample data
#
# Usage:
#   chmod +x setup-dev.sh
#   ./setup-dev.sh
#
# Requirements:
#   - macOS, Linux, or WSL
#   - Node.js 20+ installed
#   - npm installed
#   - PostgreSQL installed (or Docker)
#

set -e  # Exit on error

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}==>${NC} $1"
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

log_info "Budget Reduction Tracking - Development Environment Setup"
log_info "Project root: $PROJECT_ROOT"
echo ""

# Check Node.js version
log_step "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install Node.js 20 LTS from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js version 18+ is required. Current version: $(node -v)"
    log_error "Please upgrade Node.js from https://nodejs.org/"
    exit 1
fi

log_info "Node.js version: $(node -v)"
log_info "npm version: $(npm -v)"
echo ""

# Check PostgreSQL
log_step "Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    log_warn "PostgreSQL is not installed or not in PATH"
    echo ""
    echo "Installation instructions:"
    echo "  macOS:   brew install postgresql@16"
    echo "  Ubuntu:  sudo apt install postgresql postgresql-contrib"
    echo "  Docker:  docker run -d --name budget-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16"
    echo ""
    read -p "Do you want to continue with Docker PostgreSQL setup? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "PostgreSQL is required. Please install and run this script again."
        exit 1
    fi

    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install PostgreSQL manually or install Docker."
        exit 1
    fi

    # Start PostgreSQL in Docker
    log_info "Starting PostgreSQL 16 in Docker..."
    if docker ps -a | grep -q budget-db; then
        log_info "Removing existing budget-db container..."
        docker rm -f budget-db
    fi
    docker run -d \
        --name budget-db \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_DB=budget_tracking \
        -p 5432:5432 \
        postgres:16

    log_info "Waiting for PostgreSQL to start..."
    sleep 5

    USE_DOCKER_PG=true
    DB_USER="postgres"
    DB_PASSWORD="postgres"
    DB_NAME="budget_tracking"
else
    log_info "PostgreSQL found: $(psql --version | head -1)"
    USE_DOCKER_PG=false

    # Database configuration
    DB_USER="budget_user"
    DB_PASSWORD="dev_password"
    DB_NAME="budget_tracking"

    # Create database and user
    log_step "Setting up PostgreSQL database..."

    # Check if database exists
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        log_warn "Database '$DB_NAME' already exists"
        read -p "Drop and recreate? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true
            log_info "Database dropped"
        fi
    fi

    # Create database and user
    sudo -u postgres psql <<EOF
-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE $DB_NAME'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Connect to database and grant schema privileges
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;
EOF

    log_info "Database '$DB_NAME' created successfully"
fi

echo ""

# Setup backend
log_step "Setting up backend..."
cd "$PROJECT_ROOT/backend"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    log_info "Creating backend .env file from template..."
    if [ -f ../config/development.env.template ]; then
        cp ../config/development.env.template .env
    else
        cat > .env <<EOF
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}
JWT_SECRET=dev-jwt-secret-change-in-production-min-64-chars
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=dev-refresh-secret-change-in-production
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
EOF
    fi
    log_info ".env file created"
else
    log_warn ".env file already exists, skipping creation"
fi

# Install backend dependencies
log_info "Installing backend dependencies..."
npm install

# Run Prisma migrations if schema exists
if [ -f prisma/schema.prisma ]; then
    log_info "Running Prisma migrations..."
    npx prisma generate
    npx prisma migrate dev --name init

    # Seed database if seed script exists
    if [ -f prisma/seed.ts ] || [ -f prisma/seed.js ]; then
        log_info "Seeding database with sample data..."
        npx prisma db seed || log_warn "Seeding failed or not configured"
    fi
else
    log_warn "Prisma schema not found, skipping migrations"
fi

echo ""

# Setup frontend
log_step "Setting up frontend..."
cd "$PROJECT_ROOT/frontend"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    log_info "Creating frontend .env file..."
    cat > .env <<EOF
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Budget Reduction Tracker
EOF
    log_info ".env file created"
else
    log_warn ".env file already exists, skipping creation"
fi

# Install frontend dependencies
log_info "Installing frontend dependencies..."
npm install

echo ""

# Print success message
log_info "========================================="
log_info "Development Environment Setup Complete!"
log_info "========================================="
echo ""
log_info "Database Configuration:"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Host: localhost:5432"
echo "  Connection: postgresql://${DB_USER}:****@localhost:5432/${DB_NAME}"
if [ "$USE_DOCKER_PG" = true ]; then
    echo "  Running in: Docker (container: budget-db)"
fi
echo ""
log_info "Next Steps:"
echo ""
echo "1. Start the backend development server:"
echo "   ${BLUE}cd backend && npm run dev${NC}"
echo ""
echo "2. In another terminal, start the frontend:"
echo "   ${BLUE}cd frontend && npm run dev${NC}"
echo ""
echo "3. Access the application:"
echo "   Frontend: ${BLUE}http://localhost:5173${NC}"
echo "   Backend:  ${BLUE}http://localhost:3001${NC}"
echo "   Health:   ${BLUE}http://localhost:3001/api/health${NC}"
echo ""
echo "4. (Optional) Open Prisma Studio to view database:"
echo "   ${BLUE}cd backend && npx prisma studio${NC}"
echo ""
log_info "Happy coding!"
