#!/bin/bash
#
# Budget Reduction Tracking - LXC Deployment Script
#
# This script performs a complete deployment of the Budget Reduction Tracking
# application in a Proxmox LXC container. It clones the repository, installs
# dependencies, builds the application, configures services, and starts everything.
#
# Prerequisites:
#   - LXC container setup completed (run setup-lxc.sh first)
#   - PostgreSQL installed and configured
#   - Node.js 20+, PM2, and Nginx installed
#
# Usage:
#   chmod +x deploy-lxc.sh
#   sudo ./deploy-lxc.sh
#
# Optional environment variables:
#   REPO_URL - Git repository URL (default: https://github.com/dmcguire80/Budget-Reduction-Tracking.git)
#   BRANCH - Git branch to deploy (default: main)
#   DOMAIN - Domain name for the application (optional)
#

set -e  # Exit on error
set -u  # Exit on undefined variable

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

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root or with sudo"
   exit 1
fi

# Configuration
REPO_URL="${REPO_URL:-https://github.com/dmcguire80/Budget-Reduction-Tracking.git}"
BRANCH="${BRANCH:-main}"
APP_DIR="/opt/budget-tracking"
BACKUP_DIR="/backups"
DOMAIN="${DOMAIN:-}"

log_info "========================================="
log_info "Budget Reduction Tracking - Deployment"
log_info "========================================="
echo ""
log_info "Configuration:"
echo "  Repository: $REPO_URL"
echo "  Branch: $BRANCH"
echo "  Install Directory: $APP_DIR"
echo "  Domain: ${DOMAIN:-Not specified}"
echo ""

# Verify prerequisites
log_step "Verifying prerequisites..."

if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please run setup-lxc.sh first."
    exit 1
fi

if ! command -v pm2 &> /dev/null; then
    log_error "PM2 is not installed. Please run setup-lxc.sh first."
    exit 1
fi

if ! command -v nginx &> /dev/null; then
    log_error "Nginx is not installed. Please run setup-lxc.sh first."
    exit 1
fi

if ! command -v psql &> /dev/null; then
    log_error "PostgreSQL is not installed. Please run setup-lxc.sh first."
    exit 1
fi

log_info "All prerequisites satisfied"
echo ""

# Load database credentials if available
if [ -f /root/.db_credentials ]; then
    log_info "Loading database credentials..."
    source /root/.db_credentials
else
    log_warn "Database credentials not found at /root/.db_credentials"
    log_warn "You will need to configure the DATABASE_URL manually"
fi

# Clone or update repository
log_step "Cloning/updating repository..."

if [ -d "$APP_DIR/.git" ]; then
    log_info "Repository exists, pulling latest changes..."
    cd "$APP_DIR"
    git fetch origin
    git checkout "$BRANCH"
    git pull origin "$BRANCH"
else
    log_info "Cloning repository..."
    if [ -d "$APP_DIR" ] && [ "$(ls -A $APP_DIR)" ]; then
        log_warn "$APP_DIR is not empty. Creating backup..."
        BACKUP_NAME="budget-tracking-backup-$(date +%Y%m%d_%H%M%S)"
        mv "$APP_DIR" "$BACKUP_DIR/$BACKUP_NAME"
        log_info "Backup created at $BACKUP_DIR/$BACKUP_NAME"
    fi

    mkdir -p "$APP_DIR"
    git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

log_info "Repository ready at $APP_DIR"
echo ""

# Setup backend
log_step "Setting up backend..."
cd "$APP_DIR/backend"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    log_info "Creating backend .env file..."

    # Generate secure secrets
    JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    REFRESH_TOKEN_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    SESSION_SECRET=$(openssl rand -base64 48 | tr -d '\n')

    # Determine CORS origin
    if [ -n "$DOMAIN" ]; then
        CORS_ORIGIN="https://$DOMAIN"
    else
        CORS_ORIGIN="http://localhost:3000"
        log_warn "No domain specified, using localhost for CORS_ORIGIN"
    fi

    cat > .env <<EOF
NODE_ENV=production
PORT=3001
DATABASE_URL=${DATABASE_URL:-postgresql://budget_user:CHANGE_PASSWORD@localhost:5432/budget_tracking}
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=$CORS_ORIGIN
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_FILE_PATH=/opt/budget-tracking/logs/backend.log
BCRYPT_ROUNDS=12
EOF

    chmod 600 .env
    log_info "Backend .env file created with secure secrets"
else
    log_warn "Backend .env file already exists, skipping creation"
    log_warn "Please verify DATABASE_URL and other settings are correct"
fi

# Install backend dependencies
log_info "Installing backend dependencies..."
npm ci --omit=dev

# Run Prisma migrations
if [ -f prisma/schema.prisma ]; then
    log_info "Generating Prisma client..."
    npx prisma generate

    log_info "Running database migrations..."
    npx prisma migrate deploy
else
    log_warn "Prisma schema not found, skipping migrations"
fi

# Build backend
log_info "Building backend..."
npm run build

echo ""

# Setup frontend
log_step "Setting up frontend..."
cd "$APP_DIR/frontend"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    log_info "Creating frontend .env file..."

    if [ -n "$DOMAIN" ]; then
        API_URL="https://$DOMAIN"
    else
        API_URL="http://localhost:3000"
    fi

    cat > .env <<EOF
VITE_API_URL=$API_URL
VITE_APP_NAME=Budget Reduction Tracker
EOF

    log_info "Frontend .env file created"
else
    log_warn "Frontend .env file already exists, skipping creation"
fi

# Install frontend dependencies
log_info "Installing frontend dependencies..."
npm ci --omit=dev

# Build frontend
log_info "Building frontend for production..."
npm run build

log_info "Frontend build complete at $APP_DIR/frontend/dist"
echo ""

# Configure Nginx
log_step "Configuring Nginx..."

if [ -f "$APP_DIR/lxc/nginx-site.conf" ]; then
    log_info "Installing Nginx site configuration..."
    cp "$APP_DIR/lxc/nginx-site.conf" /etc/nginx/sites-available/budget-tracking

    # Create symlink if it doesn't exist
    if [ ! -L /etc/nginx/sites-enabled/budget-tracking ]; then
        ln -s /etc/nginx/sites-available/budget-tracking /etc/nginx/sites-enabled/budget-tracking
    fi

    # Remove default site if exists
    if [ -L /etc/nginx/sites-enabled/default ]; then
        rm /etc/nginx/sites-enabled/default
        log_info "Removed default Nginx site"
    fi

    # Test Nginx configuration
    if nginx -t; then
        log_info "Nginx configuration is valid"
        systemctl reload nginx
        log_info "Nginx reloaded successfully"
    else
        log_error "Nginx configuration test failed"
        exit 1
    fi
else
    log_warn "Nginx configuration file not found at $APP_DIR/lxc/nginx-site.conf"
    log_warn "You will need to configure Nginx manually"
fi

echo ""

# Setup PM2
log_step "Configuring PM2..."

cd "$APP_DIR/backend"

# Copy PM2 ecosystem config if exists
if [ -f "$APP_DIR/lxc/pm2-ecosystem.config.js" ]; then
    cp "$APP_DIR/lxc/pm2-ecosystem.config.js" "$APP_DIR/backend/"
fi

# Stop existing PM2 process if running
if pm2 list | grep -q "budget-tracking-api"; then
    log_info "Stopping existing PM2 process..."
    pm2 stop budget-tracking-api
    pm2 delete budget-tracking-api
fi

# Start application with PM2
log_info "Starting application with PM2..."
if [ -f pm2-ecosystem.config.js ]; then
    pm2 start pm2-ecosystem.config.js --env production
else
    pm2 start dist/index.js \
        --name budget-tracking-api \
        --max-memory-restart 500M \
        --time \
        --log-date-format "YYYY-MM-DD HH:mm:ss Z"
fi

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup systemd -u root --hp /root

log_info "PM2 configured and application started"
echo ""

# Verify deployment
log_step "Verifying deployment..."

# Wait for services to start
sleep 3

# Check PM2 status
log_info "PM2 Status:"
pm2 status

# Check Nginx status
log_info "Nginx Status:"
systemctl status nginx --no-pager | head -5

# Test backend API
log_info "Testing backend API..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    log_info "Backend API is responding"
else
    log_warn "Backend API health check failed"
fi

# Test frontend
log_info "Testing frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log_info "Frontend is accessible"
else
    log_warn "Frontend accessibility check failed"
fi

echo ""

# Print summary
log_info "========================================="
log_info "Deployment Complete!"
log_info "========================================="
echo ""
log_info "Application Details:"
echo "  Location: $APP_DIR"
echo "  Branch: $BRANCH"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:3001"
if [ -n "$DOMAIN" ]; then
    echo "  Public URL: https://$DOMAIN"
fi
echo ""
log_info "Service Management:"
echo "  PM2 Status:    ${BLUE}pm2 status${NC}"
echo "  PM2 Logs:      ${BLUE}pm2 logs budget-tracking-api${NC}"
echo "  PM2 Restart:   ${BLUE}pm2 restart budget-tracking-api${NC}"
echo "  Nginx Reload:  ${BLUE}systemctl reload nginx${NC}"
echo "  Nginx Status:  ${BLUE}systemctl status nginx${NC}"
echo ""
log_info "Logs:"
echo "  Backend:       /opt/budget-tracking/logs/backend.log"
echo "  PM2:           /opt/budget-tracking/logs/backend-*.log"
echo "  Nginx Access:  /var/log/nginx/budget-tracking-access.log"
echo "  Nginx Error:   /var/log/nginx/budget-tracking-error.log"
echo ""
log_info "Next Steps:"
echo "  1. Verify the application is working: curl http://localhost:3000"
echo "  2. Configure Nginx Proxy Manager to proxy to this LXC"
echo "  3. Set up automated backups with backup-db.sh"
echo "  4. Configure monitoring with monitor.sh"
echo ""
log_info "Deployment completed successfully!"
