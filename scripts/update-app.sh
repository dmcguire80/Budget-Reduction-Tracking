#!/bin/bash
#
# Budget Reduction Tracking - Application Update Script
#
# This script safely updates the Budget Reduction Tracking application
# by pulling the latest code, installing dependencies, running migrations,
# building, and restarting services.
#
# Features:
#   - Git pull with branch selection
#   - Automatic backup before update
#   - Dependency installation
#   - Database migrations
#   - Build process
#   - Service restart with zero-downtime (PM2 reload)
#   - Health verification
#   - Rollback on failure
#
# Usage:
#   chmod +x update-app.sh
#   sudo ./update-app.sh [branch]
#
# Examples:
#   ./update-app.sh              # Update from current branch
#   ./update-app.sh main         # Update from main branch
#   ./update-app.sh develop      # Update from develop branch
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
APP_DIR="/opt/budget-tracking"
BACKUP_DIR="/backups"
BRANCH="${1:-}"
UPDATE_LOG="/var/log/budget-tracking-update.log"

# Function to log to file
log_to_file() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$UPDATE_LOG"
}

# Function to rollback
rollback() {
    log_error "Update failed! Initiating rollback..."
    log_to_file "ERROR: Update failed, rolling back"

    cd "$APP_DIR"

    # Restore git to previous commit
    if [ -n "${PREVIOUS_COMMIT:-}" ]; then
        log_info "Reverting to previous commit: $PREVIOUS_COMMIT"
        git checkout "$PREVIOUS_COMMIT"

        # Rebuild backend
        cd "$APP_DIR/backend"
        npm ci --omit=dev
        npm run build

        # Rebuild frontend
        cd "$APP_DIR/frontend"
        npm ci --omit=dev
        npm run build
    fi

    # Restart services
    if command -v pm2 &> /dev/null; then
        pm2 restart budget-tracking-api
    fi

    log_error "Rollback completed. Application restored to previous state."
    exit 1
}

# Set trap to rollback on error
trap rollback ERR

log_info "========================================="
log_info "Budget Reduction Tracking - Update"
log_info "========================================="
log_to_file "Starting application update"
echo ""

# Verify application directory exists
if [ ! -d "$APP_DIR" ]; then
    log_error "Application directory not found: $APP_DIR"
    exit 1
fi

cd "$APP_DIR"

# Verify it's a git repository
if [ ! -d ".git" ]; then
    log_error "Not a git repository: $APP_DIR"
    exit 1
fi

# Get current commit for rollback
PREVIOUS_COMMIT=$(git rev-parse HEAD)
PREVIOUS_BRANCH=$(git rev-parse --abbrev-ref HEAD)
log_info "Current commit: $PREVIOUS_COMMIT"
log_info "Current branch: $PREVIOUS_BRANCH"
echo ""

# Determine target branch
if [ -z "$BRANCH" ]; then
    BRANCH="$PREVIOUS_BRANCH"
    log_info "No branch specified, using current branch: $BRANCH"
else
    log_info "Target branch: $BRANCH"
fi

# Check for uncommitted changes
log_step "Checking for uncommitted changes..."
if ! git diff-index --quiet HEAD --; then
    log_warn "Uncommitted changes detected"
    git status --short
    echo ""
    read -p "Stash changes and continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git stash
        log_info "Changes stashed"
    else
        log_error "Update cancelled by user"
        exit 1
    fi
fi

# Fetch latest changes
log_step "Fetching latest changes from remote..."
git fetch origin
log_to_file "Fetched latest changes from origin"

# Check if updates are available
UPSTREAM_COMMIT=$(git rev-parse origin/"$BRANCH")
if [ "$PREVIOUS_COMMIT" = "$UPSTREAM_COMMIT" ]; then
    log_info "Already up to date. No updates available."
    log_to_file "No updates available"
    exit 0
fi

log_info "Updates available: $(git rev-list --count HEAD..origin/"$BRANCH") commit(s)"
echo ""
log_info "Recent commits:"
git log --oneline --graph --decorate -5 origin/"$BRANCH"
echo ""

# Confirmation
log_warn "This will update the application to the latest version"
read -p "Continue with update? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Update cancelled by user"
    exit 0
fi
echo ""

# Create database backup before update
log_step "Creating database backup before update..."
if [ -f "$APP_DIR/scripts/backup-db.sh" ]; then
    bash "$APP_DIR/scripts/backup-db.sh"
    log_info "Database backup completed"
else
    log_warn "Backup script not found, skipping database backup"
fi
echo ""

# Pull latest code
log_step "Pulling latest code from $BRANCH..."
git checkout "$BRANCH"
git pull origin "$BRANCH"
NEW_COMMIT=$(git rev-parse HEAD)
log_info "Updated to commit: $NEW_COMMIT"
log_to_file "Updated to commit: $NEW_COMMIT"
echo ""

# Update backend
log_step "Updating backend..."
cd "$APP_DIR/backend"

# Check if package.json changed
if git diff --name-only "$PREVIOUS_COMMIT" "$NEW_COMMIT" | grep -q "backend/package.json"; then
    log_info "package.json changed, installing dependencies..."
    npm ci --omit=dev
else
    log_info "No dependency changes detected"
fi

# Run database migrations
if [ -f prisma/schema.prisma ]; then
    log_info "Checking for database migrations..."

    if git diff --name-only "$PREVIOUS_COMMIT" "$NEW_COMMIT" | grep -q "backend/prisma/"; then
        log_info "Prisma schema changed, running migrations..."
        npx prisma generate
        npx prisma migrate deploy
        log_to_file "Database migrations applied"
    else
        log_info "No schema changes detected"
    fi
fi

# Build backend
log_info "Building backend..."
npm run build
log_to_file "Backend built successfully"
echo ""

# Update frontend
log_step "Updating frontend..."
cd "$APP_DIR/frontend"

# Check if package.json changed
if git diff --name-only "$PREVIOUS_COMMIT" "$NEW_COMMIT" | grep -q "frontend/package.json"; then
    log_info "package.json changed, installing dependencies..."
    npm ci --omit=dev
else
    log_info "No dependency changes detected"
fi

# Build frontend
log_info "Building frontend..."
npm run build
log_to_file "Frontend built successfully"
echo ""

# Restart services
log_step "Restarting services..."

# Reload PM2 (zero-downtime restart)
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "budget-tracking-api"; then
        log_info "Reloading PM2 process (zero-downtime)..."
        pm2 reload budget-tracking-api
        sleep 3
        log_to_file "PM2 reloaded"
    else
        log_warn "PM2 process not found, starting application..."
        cd "$APP_DIR/backend"
        pm2 start dist/index.js --name budget-tracking-api
        pm2 save
    fi
else
    log_warn "PM2 not found, skipping process restart"
fi

# Reload Nginx
if systemctl is-active --quiet nginx; then
    log_info "Reloading Nginx..."
    systemctl reload nginx
    log_to_file "Nginx reloaded"
else
    log_warn "Nginx is not running"
fi

echo ""

# Health check
log_step "Performing health checks..."
sleep 2

# Check PM2 status
if command -v pm2 &> /dev/null; then
    log_info "PM2 Status:"
    pm2 status
fi

# Check backend health
log_info "Checking backend API health..."
HEALTH_CHECK_ATTEMPTS=0
MAX_ATTEMPTS=5

while [ $HEALTH_CHECK_ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    if curl -f -s http://localhost:3001/api/health > /dev/null 2>&1; then
        log_info "Backend API is healthy"
        log_to_file "Backend API health check passed"
        break
    else
        ((HEALTH_CHECK_ATTEMPTS++))
        if [ $HEALTH_CHECK_ATTEMPTS -lt $MAX_ATTEMPTS ]; then
            log_warn "Health check failed, retrying... ($HEALTH_CHECK_ATTEMPTS/$MAX_ATTEMPTS)"
            sleep 2
        else
            log_error "Backend API health check failed after $MAX_ATTEMPTS attempts"
            log_to_file "ERROR: Backend API health check failed"
            rollback
        fi
    fi
done

# Check frontend
log_info "Checking frontend..."
if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
    log_info "Frontend is accessible"
    log_to_file "Frontend health check passed"
else
    log_warn "Frontend health check failed"
fi

echo ""

# Summary
log_info "========================================="
log_info "Update Summary"
log_info "========================================="
echo "  Previous Commit: $PREVIOUS_COMMIT"
echo "  New Commit:      $NEW_COMMIT"
echo "  Branch:          $BRANCH"
echo "  Backend:         Updated and running"
echo "  Frontend:        Updated and rebuilt"
echo "  Database:        Migrations applied (if any)"
echo ""
log_info "Update completed successfully!"
log_to_file "Update completed successfully"
echo ""
log_info "Application is now running the latest version"
echo ""
log_warn "Rollback Information:"
echo "  If issues occur, rollback to: $PREVIOUS_COMMIT"
echo "  Command: git checkout $PREVIOUS_COMMIT && ./update-app.sh"
echo ""

# Disable error trap (successful completion)
trap - ERR

exit 0
